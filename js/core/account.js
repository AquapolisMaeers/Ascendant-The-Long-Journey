'use strict';
(function(G, U) {
  const A = G.account = {
    enabled: G.data.config.saveMode === 'account' && ['http:', 'https:'].includes(location.protocol),
    ready: false, locked: false, user: null, revision: 0, pending: null,
    busy: null, phase: 'checking', message: '', mode: 'login', status: 'Connecting...',
    playable() { return !this.enabled || this.ready && !this.locked; },
    key(suffix) { return 'ascendant.account.' + this.user.id + '.' + suffix; },
    async request(path, method = 'GET', data = null, keepalive = false) {
      let response;
      try {
        response = await fetch('/api/' + path, {
          method, credentials: 'same-origin', cache: 'no-store', keepalive,
          headers: data === null ? {} : {'Content-Type': 'application/json', 'X-Ascendant-Request': '1'},
          body: data === null ? undefined : JSON.stringify(data),
          signal: keepalive ? undefined : AbortSignal.timeout(15000)
        });
      } catch {
        throw Object.assign(Error('Cannot reach the account server. Your device backup is preserved.'), {status: 0});
      }
      let result;
      try { result = await response.json(); }
      catch { throw Error('The account service is unavailable at this address.'); }
      if (!response.ok) throw Object.assign(Error(result.error || 'Account request failed.'), {status: response.status});
      return result;
    },
    async start(bootstrap) {
      this.bootstrap = bootstrap;
      U.render();
      try {
        const session = await this.request('session');
        await this.accept(session.user);
      } catch (error) {
        this.ready = false;
        this.phase = 'login';
        this.message = error.status === 401 ? '' : error.message;
        U.render();
      }
    },
    async accept(user, discardPending = false) {
      this.ready = false;
      this.locked = false;
      this.user = user;
      G.save.useAccount(user.id);
      const remote = await this.request('save');
      this.revision = remote.revision;
      let local = null;
      try { local = JSON.parse(localStorage.getItem(this.key('pending')) || 'null'); }
      catch { this.message = 'A device backup could not be read. It has been preserved.'; }
      // A keepalive save may have reached the server just as this page closed.
      if (local?.commit && local.commit === remote.commit) {
        localStorage.removeItem(this.key('pending'));
        local = null;
      }
      // Heartbeat timestamps can change while a final upload is in flight.
      // If every gameplay value matches, that is an accepted save, not a conflict.
      if (local && remote.payload) {
        const canonical = value => {
          if (Array.isArray(value)) return value.map(canonical);
          if (!value || typeof value !== 'object') return value;
          return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
        };
        const gameplay = payload => {
          const copy = G.clone(payload);
          delete copy.profile.savedAt;
          copy.profile.slots.filter(Boolean).forEach(c => delete c.lastSeen);
          return JSON.stringify(canonical(copy));
        };
        if (gameplay(local.payload) === gameplay(remote.payload)) {
          localStorage.removeItem(this.key('pending'));
          local = null;
        }
      }
      if (discardPending && local) {
        localStorage.setItem(this.key('conflict'), JSON.stringify(local));
        localStorage.removeItem(this.key('pending'));
        local = null;
      }
      if (local && local.revision !== remote.revision) {
        this.pending = local.payload;
        G.state = local.payload.profile;
        this.phase = 'conflict';
        this.message = 'This device has unsynced progress and the account has a newer save. Download your device backup, then load the account save to continue.';
        U.close();
        U.render();
        return;
      }
      const payload = local?.payload || remote.payload || {profile: G.newProfile(), fates: {}};
      G.save.fates = payload.fates;
      localStorage.setItem(G.save.storageKey() + '.fates', JSON.stringify(payload.fates));
      G.state = G.save.migrate(payload.profile);
      G.runtime.loadFailure = false;
      G.runtime.page = 'World';
      G.runtime.tab = '';
      G.runtime.recent = [];
      G.runtime.estimate = null;
      G.runtime.log = [];
      G.systems.afk.stop('Signed in', false);
      G.save.lastGoodText = null;
      // The bootstrap loads only this account's current, validated snapshot.
      localStorage.setItem(G.save.storageKey(), JSON.stringify(G.state));
      this.pending = local?.payload || null;
      this.commit = local?.commit || null;
      this.ready = true;
      this.phase = 'game';
      this.message = '';
      this.status = this.pending ? 'Device backup restored; syncing...' : 'Saved to account';
      G.audio.suspended = false;
      this.bootstrap();
      this.updateStatus();
      if (this.pending) await this.flush();
    },
    queue() {
      if (!this.enabled || !this.ready || G.runtime.loadFailure) return;
      this.pending = {profile: G.clone(G.state), fates: G.clone(G.save.fates)};
      this.commit = G.uid();
      try {
        localStorage.setItem(this.key('pending'), JSON.stringify({revision: this.revision, payload: this.pending, commit: this.commit}));
        this.status = 'Saved on device; syncing...';
      } catch {
        this.status = 'Device backup unavailable; syncing to account...';
      }
      this.updateStatus();
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.flush(), 400);
    },
    async flush(keepalive = false) {
      if (!this.ready || !this.pending) return true;
      if (this.busy) return this.busy;
      const snapshot = this.pending, commit = this.commit;
      this.busy = (async () => {
        try {
          const result = await this.request('save', 'PUT', {revision: this.revision, payload: snapshot, commit}, keepalive);
          this.revision = result.revision;
          if (this.pending === snapshot) {
            this.pending = null;
            localStorage.removeItem(this.key('pending'));
            this.status = 'Saved to account';
          } else {
            localStorage.setItem(this.key('pending'), JSON.stringify({revision: this.revision, payload: this.pending, commit: this.commit}));
            this.status = 'Saved on device; syncing...';
          }
          this.updateStatus();
          return true;
        } catch (error) {
          this.status = error.status === 409 ? 'Save conflict; progress paused' : error.status === 401 ? 'Sign-in expired; progress paused' : 'Saved on device; server unavailable';
          this.updateStatus();
          if (error.status === 409 || error.status === 401 || error.status === 400) {
            this.ready = false;
            this.phase = error.status === 401 ? 'login' : 'conflict';
            this.message = error.message + ' Your device backup is preserved.';
            G.systems.afk.stop('Account sync paused', false);
            G.audio.suspend();
            U.close();
            U.render();
          }
          return false;
        }
      })();
      try { return await this.busy; }
      finally { this.busy = null; }
    },
    updateStatus() {
      document.querySelectorAll('[data-account-status]').forEach(el => el.textContent = this.status);
    },
    download() {
      const payload = this.pending || {profile: G.state, fates: G.save.fates};
      const file = new Blob([JSON.stringify(payload.profile, null, 2)], {type: 'application/json'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = 'Ascendant-' + (this.user?.username || 'device') + '-backup.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    },
    async logout() {
      this.locked = true;
      G.systems.afk.stop('Signing out', false);
      G.save.write();
      while (this.pending) {
        if (!await this.flush()) { this.locked = false; throw Error('Sign-out paused until your progress can sync. Use Export save for a backup.'); }
      }
      await this.request('logout', 'POST', {});
      this.ready = false;
      this.locked = false;
      this.user = null;
      this.phase = 'login';
      this.message = 'Signed out. Your characters are saved to your account.';
      G.audio.suspend();
      U.close();
      G.state = G.newProfile();
      G.save.useAccount(null);
      document.getElementById('loot-popup').hidden = true;
      U.render();
    },
    screen() {
      const brand = '<div class="brand"><img src="assets/icons/crest.svg" alt=""><div><strong>ASCENDANT</strong><small>THE LONG JOURNEY</small></div></div>';
      let form;
      if (this.phase === 'checking') {
        form = '<h2>Connecting to your account...</h2><p class="notes spacer">Your characters will appear after sign-in.</p>';
      } else if (this.phase === 'conflict') {
        form = '<h2>Choose your saved journey</h2><p class="notes spacer" role="alert">' + U.e(this.message) + '</p><div class="stack spacer"><button class="btn" data-account="download">Download device backup</button><button data-account="reload" class="btn gold-btn">Load account save</button></div><p class="notes spacer">The device copy is also kept as a recovery snapshot.</p>';
      } else {
        const register = this.mode === 'register';
        form = '<div class="eyebrow">YOUR ACCOUNT</div><h2 class="spacer">' + (register ? 'Begin your journey' : 'Welcome back') + '</h2><p class="notes spacer">Sign in to play. Your three characters follow your account across devices.</p><form id="account-form" class="stack spacer"><label>Username<input id="account-username" name="username" autocomplete="username" minlength="3" maxlength="32" pattern="[A-Za-z0-9_]{3,32}" required></label><label>Password<input id="account-password" name="password" type="password" autocomplete="' + (register ? 'new-password' : 'current-password') + '" minlength="12" maxlength="128" required></label><p class="notes">Usernames use letters, numbers and underscores. Passwords contain at least 12 characters.</p><p id="account-error" role="alert" class="notes bad">' + U.e(this.message) + '</p><button type="submit" class="btn gold-btn">' + (register ? 'Create account' : 'Sign in') + '</button><button type="button" data-account="mode" class="btn quiet">' + (register ? 'Already have an account? Sign in' : 'Create an account') + '</button></form><p class="notes spacer">Bringing an existing character? Export your save from the offline game, then import it after signing in. If you forget your password, contact the game host for a reset.</p>';
      }
      return '<div class="welcome account-welcome"><section class="welcome-art">' + brand + '<div><div class="eyebrow">A MEDIEVAL FANTASY SEMI-IDLE RPG</div><h1>Your next<br>chapter awaits.</h1></div><p class="footer-note">ONE ACCOUNT &middot; THREE CHARACTERS</p></section><main class="welcome-form">' + form + '</main></div>';
    }
  };
  const shell = U.shell;
  U.shell = () => {
    if (!A.enabled) return shell();
    if (!A.ready) return A.screen();
    const identity = '<div class="account-identity"><strong>' + U.e(A.user.username) + '</strong><small data-account-status>' + U.e(A.status) + '</small><button data-account="logout" class="btn small quiet">Sign out</button></div>';
    return shell().replace('\u25cf OFFLINE \u00b7 LOCAL SAVE', '\u25cf ACCOUNT SAVE').replace('OFFLINE \u00b7 LOCAL SAVE \u00b7 USE THE SAME BROWSER PROFILE', 'ACCOUNT SAVE \u00b7 PLAY ON ANY DEVICE').replace('<main class="welcome-form">', '<main class="welcome-form">' + identity).replace('<div class="sidebar-foot">', '<div class="sidebar-foot">' + identity);
  };
  const settings = U.screens.Settings;
  U.screens.Settings = () => {
    let html = settings();
    if (!A.enabled) return html;
    html = html.replace('<h3>Local save</h3>', '<h3>Account save</h3>').replace('Progress saves on this device in this browser profile. Export a backup before clearing site data or switching browsers or site addresses.', 'Your characters sync to your account. Export a backup before switching devices if the server is unavailable.').replace('Reset all local progress', 'Reset account progress');
    return '<section class="panel spacer"><h3>Signed in as ' + U.e(A.user.username) + '</h3><p class="notes spacer" data-account-status>' + U.e(A.status) + '</p><div class="row spacer"><button class="btn" data-account="sync">Sync now</button><button data-account="logout" class="btn quiet">Save & sign out</button></div><p class="notes spacer">Sign out before continuing on another device. Conflicting saves pause progress and preserve a device backup.</p></section>' + html;
  };
  document.addEventListener('submit', async event => {
    if (event.target.id !== 'account-form') return;
    event.preventDefault();
    const form = event.target, button = form.querySelector('[type=submit]');
    button.disabled = true;
    try {
      const session = await A.request(A.mode === 'register' ? 'register' : 'login', 'POST', {
        username: form.elements.username.value.trim(), password: form.elements.password.value
      });
      form.elements.password.value = '';
      await A.accept(session.user);
    } catch (error) {
      A.message = error.message;
      const message = document.getElementById('account-error');
      if (message) message.textContent = error.message;
      else { A.phase = 'login'; A.ready = false; U.render(); }
    } finally { button.disabled = false; }
  });
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-account]');
    if (!button || button.disabled) return;
    event.stopImmediatePropagation();
    const action = button.dataset.account;
    if (action === 'mode') { A.mode = A.mode === 'login' ? 'register' : 'login'; A.message = ''; U.render(); return; }
    if (action === 'download') { A.download(); return; }
    button.disabled = true;
    try {
      if (action === 'logout') await A.logout();
      if (action === 'reload') await A.accept(A.user, true);
      if (action === 'sync') { G.save.write(); await A.flush(); }
    } catch (error) { G.notify(error.message, 'error'); A.locked = false; }
    finally { button.disabled = false; }
  }, true);
  window.addEventListener('rpg:saved', () => A.queue());
  window.addEventListener('online', () => A.flush());
  setInterval(() => { if (A.enabled && A.ready && A.pending) A.flush(); }, 5000);
})(RPG, RPG.ui);
