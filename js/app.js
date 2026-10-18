'use strict';
(function(G, D, S, U) {
  const value = id => document.getElementById(id)?.value;
  const confirm = U.confirm;
  const itemAction = (method, id, ...args) => {
    const lesson = S.tutorial.current()?.id;
    S[method[0]][method[1]](id, ...args);
    if (lesson && lesson !== S.tutorial.current()?.id) { U.close(); U.render(); return; }
    if (S.items.find(id)) U.item(id);
    else U.close();
  };
  const resumeSelection = () => {
    if (!G.runtime.needsResume) return;
    S.offline.resume();
    G.runtime.needsResume = false;
  };
  const showOffline = () => {
    if (!G.runtime.offline?.length || G.runtime.selecting || document.querySelector('.modal')) return;
    U.offlineReport(G.runtime.offline);
    G.runtime.offline = [];
  };
  window.addEventListener('rpg:dialog-closed', () => setTimeout(showOffline, 0));
  window.addEventListener('rpg:offline-progress', () => setTimeout(showOffline, 0));
  const actions = {
    patchNotes() {
      U.modal('Patch notes', U.patchNotes(true));
    },
    navigate(el) {
      const previous = G.runtime.page;
      const requested = el.dataset.value;
      const destination = requested==='Emporium'?'Shop':requested;
      if(destination==='Shop')G.runtime.shopSection=requested==='Emporium'?'emporium':'general';
      if (destination === 'Marketplace') S.market.assert();
      if (document.querySelector('.phone-menu')) U.close();
      G.runtime.page = destination;
      if(U.isPhone()&&destination==='World')G.runtime.mobileWorldView='explore';
      G.runtime.tab = '';
      G.runtime.search = '';
      U.render();
      if (U.isPhone() && (previous !== destination||destination==='World')) window.scrollTo({top:0, behavior:'instant'});
    },
    mobileMenu() { U.mobileMenu(); },
    mobileWorldView(el) { U.mobileWorldView(el.dataset.view); },
    provisionsShop() { G.runtime.page='Shop'; G.runtime.shopSection='general'; G.runtime.tab='Character'; U.render(); },
    learnTalent(el) { U.confirmTalent(el.dataset.id); },
    resetTalents() {
      U.resetBuild('talent-reset');
    },
    resetPerks() { U.resetBuild('perk-reset'); },
    useReset(el) { U.resetBuild(el.dataset.key); },
    utilityShop() { U.utilityShop(); },
    shopSection(el) { G.runtime.shopSection=el.dataset.section; G.runtime.page='Shop';G.runtime.tab='';U.render(); },
    tab(el) {
      G.runtime.tab = el.dataset.value;
      U.render();
    },
    slots() {
      G.ensureIdle();
      G.assert(!G.character()?.dungeon, 'Leave the dungeon before switching characters.');
      U.modal('Character chronicles', '<div class="slot-grid">' + G.state.slots.map((c, i) => '<button class="slot" data-action="' + (c ? 'selectSlot' : 'create') + '" data-slot="' + i + '"><span class="slot-number">0' + (i + 1) + '</span><div><strong>' + (c ? U.e(c.name) : 'Create a new character') + '</strong><small>' + (c ? c.class + ' · ' + c.mode + ' · Lv ' + c.level : 'An isolated new journey') + '</small></div></button>').join('') + '</div>');
    },
    selectSlot(el) {
      const current = G.character();
      const slot = Number(el.dataset.slot);
      G.assert(G.state.slots[slot], 'Choose an occupied character slot.');
      G.assert(G.runtime.selecting && slot === G.state.active || !current?.combat && !current?.dungeon && !current?.activity, 'Finish the current activity or dungeon first.');
      resumeSelection();
      if (current && !G.runtime.selecting) current.lastSeen = Date.now();
      G.state.active = slot;
      G.runtime.selecting = false;
      S.tutorial.ensure();
      const result = S.offline.apply(G.character());
      G.runtime.page = 'World';
      G.runtime.tab = '';
      G.runtime.recent = [];
      G.runtime.estimate = null;
      U.close();
      G.commit();
      S.offline.record(result);
      showOffline();
    },
    create(el) {
      G.assert(!G.character()?.combat && !G.character()?.dungeon && !G.character()?.activity, 'Finish the current activity first.');
      const slot = +el.dataset.slot;
      G.assert(!G.state.slots[slot], 'This slot is occupied.');
      G.runtime.creation = null;
      U.creation(slot);
    },
    createClass(el) {
      G.runtime.creation.class = el.dataset.value;
      G.runtime.creation.appearance.portrait = D.appearanceKind(el.dataset.value);
      U.creation(G.runtime.creation.slot, 1);
    },
    createLook(el) {
      const f = G.runtime.creation;
      f.appearance = {portrait:D.appearanceKind(f.class), look:Number(el.dataset.look), color:value('create-color') || f.appearance.color};
      U.creation(f.slot, 3);
    },
    customize() { U.customize(); },
    appearanceLook(el) {
      delete G.runtime.appearanceDraft.outfit;
      G.runtime.appearanceDraft.look = Number(el.dataset.look);
      G.runtime.appearanceDraft.color = value('appearance-color') || G.runtime.appearanceDraft.color;
      U.customizer();
    },
    appearanceOutfit() {
      const c=G.character(),entry=D.regalia.find(r=>r.id===c.regalia.outfit&&r.kind==='outfit');
      G.assert(entry&&c.regalia.owned.includes(entry.id),'Equip an owned outfit to select its portrait.');
      G.runtime.appearanceDraft.outfit=entry.id;U.customizer();
    },
    createMode(el) {
      G.runtime.creation.mode = el.dataset.value;
      G.runtime.creation.modeConfirmed = false;
      U.creation(G.runtime.creation.slot, 2);
    },
    createNext() {
      const f = G.runtime.creation;
      if (f.step === 0) {
        f.name = value('create-name').trim();
        G.assert(f.name.length >= 2 && f.name.length <= 24, 'Name must contain 2–24 characters.');
      }
      if (f.step === 2 && !f.modeConfirmed) {
        confirm('Confirm ' + f.mode + ' mode', '<div class="warning spacer">' + D.modeDescriptions[f.mode] + '</div><p>Mode is permanent, except that a fallen Hardcore Ironman becomes Ironman. Continue with this choice?</p>', () => {
          f.modeConfirmed = true;
          U.creation(f.slot, 3);
        }, f.mode.includes('Hardcore'), 'createModeCancel');
        return;
      }
      if (f.step === 3) f.appearance = {
        portrait: D.appearanceKind(f.class),
        look: Number(value('create-portrait')),
        color: value('create-color')
      };
      U.creation(f.slot, f.step + 1);
    },
    createModeCancel() { U.creation(G.runtime.creation.slot, 2); },
    createBack() {
      const f = G.runtime.creation;
      U.creation(f.slot, f.step - 1);
    },
    createFinish() {
      const f = G.runtime.creation;
      G.assert(f.modeConfirmed, 'Confirm your game mode before beginning.');
      G.assert(f.mode !== 'Hardcore' || document.getElementById('hardcore-confirm').checked, 'Acknowledge permanent Hardcore death before creating this character.');
      G.assert(!G.state.slots[f.slot], 'This character slot is occupied.');
      resumeSelection();
      if (G.character() && !G.runtime.selecting) G.character().lastSeen = Date.now();
      G.runtime.selecting = false;
      G.state.slots[f.slot] = G.newCharacter(f.name, f.class, f.mode, f.appearance);
      G.state.active = f.slot;
      G.runtime.page = 'World';
      G.runtime.loadFailure = false;
      U.close();
      S.tutorial.ensure();
      G.commit();
      G.runtime.justCreatedTutorial = true;
      U.tutorial(0);
      showOffline();
    },
    tutorialAdvance() {
      G.runtime.page = 'World';
      G.runtime.tab = '';
      S.world.advance();
    },
    tutorialGather() {
      G.runtime.page = 'World';
      G.runtime.tab = '';
      S.world.gather();
    },
    tutorialFight() {
      G.runtime.page = 'World';
      G.runtime.tab = '';
      S.combat.start();
    },
    tutorialStart() {
      U.close();
      S.tutorial.start();
    },
    tutorialLesson() { U.lesson(); },
    tutorialAcknowledge() { S.tutorial.acknowledge(); },
    tutorialTask() { U.lesson(); },
    rest() {
      S.recovery.rest();
    },
    inn(el) {
      S.recovery.inn(Number(el.dataset.fraction));
    },
    sellQuantity(el) {
      const item = S.items.find(G.runtime.sellItem), input = document.getElementById('sell-quantity');
      G.assert(item && input, 'Choose an inventory item to sell.');
      input.value = el.dataset.quantity === 'all' ? item.quantity || 1 : Math.min(item.quantity || 1, Number(el.dataset.quantity));
      input.dispatchEvent(new Event('input', {bubbles: true}));
    },
    buyQuantity(el) {
      const item = D.shop.find(i => i.id === G.runtime.buyItem), input = document.getElementById('buy-quantity');
      G.assert(item && input, 'Choose a material to buy.');
      const max = Math.min(1000000, Math.floor(G.character().coins / item.price));
      input.value = el.dataset.quantity === 'all' ? max : Math.min(max, Number(el.dataset.quantity));
      input.dispatchEvent(new Event('input', {bubbles: true}));
    },
    buyConfirm() {
      S.shop.buy(G.runtime.buyItem, Number(value('buy-quantity')));
      U.close();
    },
    exchangeReview() { U.exchangeReview(); },
    exchangeMax() { U.exchangeMax(); },
    companionPage(el) { G.runtime.companionPage=Number(el.dataset.page); U.render(); },
    openChest() {
      S.world.openChest();
    },
    sellForm(el) {
      U.sellForm(el.dataset.id);
    },
    sellConfirm() {
      S.shop.sell(G.runtime.sellItem, Number(value('sell-quantity')));
      U.close();
    },
    openPerks() {
      G.runtime.page = 'Character';
      G.runtime.tab = 'Perks';
      U.render();
    },
    afkStart() { S.afk.start(); },
    afkStop() { S.afk.stop('Stopped by you'); G.commit(); },
    audioPreview() { G.audio.preview(value('audio-scene-preview') || 'mining'); },
    audioPreviewStop() { G.audio.endPreview(); },
    advance() {
      S.world.advance();
    },
    moveOn() {
      S.world.moveOn();
    },
    fight() {
      S.combat.start();
    },
    gather() {
      S.world.gather();
    },
    stopActivity() {
      S.world.stop();
    },
    eat() {
      S.combat.manualEat();
    },
    locations() {
      U.locations();
    },
    location(el) {
      U.travelConfirmation(Number(el.dataset.id));
    },
    questTravel(el) {
      U.travelConfirmation(Number(el.dataset.id));
    },
    enterDungeon() {
      S.dungeons.enter();
    },
    nextRoom() {
      S.dungeons.next();
    },
    roomEvent() {
      S.dungeons.event();
    },
    leaveDungeon() {
      confirm('Abandon this dungeon?', '<p>The entrance must be rediscovered through Advance. Earned rewards are kept.</p>', () => S.dungeons.leave(), true);
    },
    perk(el) {
      const level = +el.dataset.level,
        choice = +el.dataset.choice;
      confirm('Choose this perk?', '<p>' + D.perkNames[G.character().class][D.perkLevels.indexOf(level)][choice] + ': ' + D.perkDescriptions[D.perkLevels.indexOf(level)][choice] + '</p>', () => S.character.choose(level, choice));
    },
    item(el) {
      U.item(el.dataset.id);
    },
    equip(el) {
      itemAction(['inventory', 'equip'], el.dataset.id);
    },
    unequip(el) {
      S.inventory.unequip(el.dataset.slot);
      U.close();
    },
    lock(el) {
      itemAction(['inventory', 'lock'], el.dataset.id);
    },
    enhance(el) {
      U.enhanceConfirmation(el.dataset.id);
    },
    enhanceCancel() {
      U.item(G.runtime.enhancePending.id);
      G.runtime.enhancePending = null;
    },
    enhanceConfirm() {
      const pending = G.runtime.enhancePending, item = pending && S.items.find(pending.id);
      G.assert(item && item.enhance === pending.enhance && item.rarity === pending.rarity, 'This item changed. Review its current enhancement quote.');
      itemAction(['upgrades', 'enhance'], pending.id);
      G.runtime.enhancePending = null;
    },
    adoptCompanion(el) { S.companions.adopt(el.dataset.type); },
    ascendCompanion() {
      const c = G.character(), p = c.companion, q = S.companions.ascensionQuote(p);
      G.assert(q.nextCap !== undefined && p.level === q.cap, 'Reach your current companion level cap first.');
      confirm('Ascend ' + U.e(S.companions.name(p)) + '?',
        '<div class="ascension-quote"><strong>' + G.percent(q.chance, 0) + ' success</strong><span>' + q.stones + ' Ascendant Stone' + (q.stones === 1 ? '' : 's') + '</span></div>' +
        '<p class="spacer">Unlock ' + q.rarity + ' rarity and a level cap of ' + q.nextCap + '. Your current level stays ' + p.level + '.</p>' +
        '<p class="notes spacer">Every attempt consumes the listed unlocked stones. Failure preserves your companion, level and rarity. Success chances do not change after failure.</p>', () => {
          G.assert(c === G.character() && c.companion === p && (p.ascensions || 0) === q.rank && p.level === q.cap, 'Your companion changed. Review its current ascension.');
          S.companions.ascend();
        });
    },
    trainingDialog() { U.trainingDialog(); },
    activityView() { U.activityView(); },
    gearPortrait() { U.gearPortrait(); },
    gemGuide() { U.gemGuide(); },
    gemGuideBack(el) { if(S.items.find(el.dataset.id))U.item(el.dataset.id);else U.close(); },
    portraitEquipment() { U.close(); G.runtime.page='Character'; G.runtime.tab='Equipment'; U.render(); if(U.isPhone())window.scrollTo(0,0); },
    emporiumOpen(el) { U.emporiumOpen(el.dataset.id); },
    equipRegalia(el) { S.emporium.equip(el.dataset.id); U.close(); },
    unequipRegalia(el) { S.emporium.unequip(el.dataset.kind); },
    equipPet(el) { S.emporium.equipPet(el.dataset.id); U.close(); },
    regaliaCollection(el) { U.regaliaCollection(el.dataset.kind); },
    visitEmporium(el) { U.close(); G.runtime.page='Shop';G.runtime.shopSection='emporium'; G.runtime.tab=({outfit:'Outfit Mystery Boxes',aura:'Aura Mystery Boxes',mount:'Mount Mystery Boxes'})[el.dataset.kind]||''; U.render(); },
    ascendantHelp() { U.ascendantHelp(); },
    emporiumPage(el) { const category=D.emporiumCategories.find(e=>e.name===G.runtime.tab)||D.emporiumCategories[0]; G.runtime.emporiumView=category.name+'|'+(G.runtime.regaliaGroup||'All'); G.runtime.emporiumPage=+el.dataset.page; U.render(); },
    achievementPage(el) { G.runtime.achievementGroup = el.dataset.group; G.runtime.achievementPage = +el.dataset.page; U.render(); },
    sellCategory(el) { G.runtime.sellCategory = el.dataset.category; U.render(); },
    feedCompanion() { S.companions.feed(value('companion-food')); },
    reviveCompanion() { S.companions.revive(); },
    releaseCompanion() {
      confirm('Return your companion to the stable?', '<p>Your companion keeps its level, XP and ascensions. Its bonuses stop until you equip it again. You can own several companions and equip one at a time.</p>', () => S.companions.release());
    },
    ascend(el) {
      U.ascendConfirmation(el.dataset.id);
    },
    ascendCancel() {
      U.item(G.runtime.ascendPending.id);
      G.runtime.ascendPending = null;
    },
    ascendConfirm() {
      const pending = G.runtime.ascendPending, item = pending && S.items.find(pending.id);
      G.assert(item && item.rarity === pending.rarity && item.enhance === pending.enhance, 'This item changed. Review its current ascension quote.');
      itemAction(['upgrades', 'ascend'], pending.id);
      G.runtime.ascendPending = null;
    },
    socket(el) {
      const key = value('socket-' + el.dataset.index);
      itemAction(['upgrades', 'socket'], el.dataset.id, +el.dataset.index, key);
    },
    extract(el) {
      itemAction(['upgrades', 'extract'], el.dataset.id, +el.dataset.index);
    },
    destroyGem(el) {
      const id = el.dataset.id,
        index = +el.dataset.index;
      confirm('Destroy this socketed gem?', '<p>The gem is permanently destroyed. Safe extraction uses a Gem Extractor.</p>', () => itemAction(['upgrades', 'extract'], id, index, true), true);
    },
    removeEnchant(el) {
      const id = el.dataset.id;
      confirm('Remove all enchantments?', '<p>Consumes one Enchantment Remover. This item returns to +0, with no prefixes or sockets. Rarity is preserved. Extract or destroy gems first.</p>', () => itemAction(['upgrades', 'remove'], id), true);
    },
    discard(el) {
      const id = el.dataset.id,
        item = S.items.find(id);
      G.assert(!item.locked, 'Unlock this item before discarding it.');
      G.runtime.discardId = id;
      U.modal('Discard ' + U.e(U.itemName(item)) + '?', '<p>This action permanently destroys the item' + (item.kind === 'gear' ? ' and any socketed gems' : '') + '.</p>' + (item.quantity ? '<label>Quantity<input type="number" id="discard-quantity" min="1" max="' + item.quantity + '" value="1"></label>' : '') + '<div class="modal-actions">' + U.btn('Cancel', 'closeModal') + U.btn('Permanently discard', 'discardConfirm', '', 'danger') + '</div>');
    },
    discardConfirm() {
      const quantity = Number(value('discard-quantity') || 1);
      G.assert(Number.isInteger(quantity) && quantity > 0, 'Invalid quantity.');
      S.inventory.discard(G.runtime.discardId, quantity);
      U.close();
    },
    resolveLoot() {
      S.inventory.resolve();
    },
    assignFood(el) {
      G.ensureIdle();
      G.character().food = el.dataset.key;
      G.commit();
      U.close();
    },
    craftQuantity(el) { U.selectCraftQuantity(el.dataset.id,el.dataset.quantity); },
    craft(el) {
      const r=D.recipes.find(r=>r.id===el.dataset.id),c=G.character(),quantity=G.runtime.craftQuantities?.[c.id]?.[r?.id];
      G.assert(r&&Number.isSafeInteger(quantity)&&quantity>0,'Select a quantity first.');
      G.assert(quantity<=S.crafting.max(r),'Choose a quantity your unlocked ingredients can make.');
      S.crafting.start(r.id,quantity);
    },
    buy(el) {
      const item = D.shop.find(i => i.id === el.dataset.id);
      if (item?.category === 'Materials') { U.buyMaterialsForm(item.id); return; }
      confirm('Purchase ' + item.name + '?', U.shopPreview(item) + '<p>Cost: ' + G.money(item.price) + '. ' + item.description + '</p>', () => S.shop.buy(item.id));
    },
    expand() {
      const c = G.character();
      confirm('Expand your inventory?', '<p>Add 10 permanent slots for ' + G.money(D.storage[(c.capacity - 50) / 10]) + '.</p>', () => S.shop.expand());
    },
    renameForm() {
      U.modal('Change your name', '<p>Consumes one Name Change Contract.</p><label>New name<input id="rename-input" maxlength="24" value="' + U.e(G.character().name) + '"></label><div class="modal-actions">' + U.btn('Change name', 'renameConfirm', '', 'gold-btn') + '</div>');
    },
    renameConfirm() {
      S.shop.rename(value('rename-input'));
      U.close();
    },
    appearanceForm() { U.customize(); },
    appearanceConfirm() {
      S.character.customize({look:G.runtime.appearanceDraft.look, color:value('appearance-color'),outfit:G.runtime.appearanceDraft.outfit});
      U.close();
    },
    listForm(el) {
      S.market.assert();
      G.runtime.listItem = el.dataset.id;
      const item = S.items.find(el.dataset.id);
      U.modal('Create a local listing', '<p>' + U.e(U.itemName(item)) + '. No online buyers exist in this build.</p><div class="field-grid"><label>Quantity<input id="listing-quantity" type="number" min="1" max="' + (item.quantity || 1) + '" value="1"></label><label>Total asking price (Bronze)<input id="listing-price" type="number" min="1" value="100"></label></div><p>1% listing fee, rounded up to a whole Bronze, is charged immediately and is not refunded.</p><div class="modal-actions">' + U.btn('Create listing', 'listConfirm', '', 'gold-btn') + '</div>');
    },
    listConfirm() {
      S.market.list(G.runtime.listItem, Number(value('listing-quantity')), Number(value('listing-price')));
      U.close();
    },
    retrieveListing(el) {
      S.market.retrieve(el.dataset.id);
    },
    save() {
      G.assert(!G.character()?.dungeon, 'Manual saves are unavailable during a dungeon. Automatic safety persistence remains active.');
      if (G.save.write()) G.notify('Progress saved locally.', 'success');
    },
    export (el) {
      const profile=el?.dataset.scope==='profile',text = G.save.export(profile?'profile':'character');
      U.modal(profile?'Back up all characters':'Export character', '<p>'+(profile?'This backup includes all three character slots. Import lets you choose which character to restore.':'This file contains '+U.e(G.character().name)+'. On import, choose an empty slot or restore this character in its current slot.')+'</p><textarea id="export-text" readonly aria-label="Exported save"></textarea><div class="modal-actions">' + U.btn('Download JSON', 'downloadSave', '', 'gold-btn') + '</div>');
      document.getElementById('export-text').value = text;
    },
    exportProfile(el) {
      actions.export({dataset:{scope:'profile'}});
    },
    downloadSave() {
      const text = value('export-text'),
        url = URL.createObjectURL(new Blob([text], {
          type: 'application/json'
        })),
        link = document.createElement('a');
      link.href = url;
      link.download = 'ascendant-save-' + new Date().toISOString().slice(0, 10) + '.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    import() {
      G.assert(!G.character()?.combat && !G.character()?.dungeon, 'Import is unavailable during combat or a dungeon.');
      U.modal('Import character', '<p>Choose a save file, then select a character and destination slot. Occupied slots belonging to other characters cannot be overwritten.</p><label>Choose a JSON file<input type="file" id="import-file" accept=".json,application/json"></label><label class="spacer">Or paste a save<textarea id="import-text" placeholder="Paste exported JSON here"></textarea></label><div class="modal-actions">' + U.btn('Review characters & slots', 'importConfirm', '', 'gold-btn') + '</div>');
    },
    importConfirm() {
      const text = value('import-text');
      U.importSlots(text);
    },
    importSlotConfirm() {
      const draft=G.runtime.importDraft;
      G.assert(draft,'Choose a save file first.');
      const {text,sourceSlot}=draft,targetSlot=Number(value('import-target')),profile=G.save.prepareImport(text),source=profile.slots[sourceSlot],existing=G.state.slots[targetSlot];
      G.assert(source&&Number.isInteger(targetSlot)&&targetSlot>=0&&targetSlot<3,'Choose a character and destination.');
      G.assert(!existing||existing.id===source.id,'Choose an empty slot.');
      const previous=existing?.id||null;
      confirm((existing?'Restore ':'Import ')+U.e(source.name)+' in slot '+(targetSlot+1)+'?', '<p>'+U.e(source.class)+' - Level '+source.level+'. '+(existing?'Restore this character’s progress from the file.':'Add this character to the empty slot.')+' Your other characters and settings are preserved.</p>',()=>{
        G.assert((G.state.slots[targetSlot]?.id||null)===previous,'The destination changed. Review the import again.');
        G.save.import(text,targetSlot,sourceSlot);
        G.notify(source.name+' imported into slot '+(targetSlot+1)+'.','success');
      },!!existing);
    },
    reset() {
      confirm('Reset all three character slots?', '<p>This removes every local character and all progression. A second confirmation follows.</p>', () => U.modal('Final reset confirmation', '<p>Type RESET to erase all local game progress.</p><input id="reset-word" aria-label="Type RESET"><div class="modal-actions">' + U.btn('Erase all progress', 'resetFinal', '', 'danger') + '</div>'), true);
    },
    resetFinal() {
      G.assert(value('reset-word') === 'RESET', 'Type RESET exactly.');
      G.save.reset();
      U.close();
    },
    deleteCharacter() {
      G.ensureIdle();
      G.assert(!G.character().dungeon, 'Leave the dungeon first.');
      const c = G.character();
      confirm('Delete ' + U.e(c.name) + ' permanently?', '<p>Only this character slot will be erased. This cannot be undone.</p>', () => {
        G.save.recordFate(G.character(), 'dead');
        G.state.slots[G.state.active] = null;
        G.commit();
      }, true);
    },
    closeModal() {
      U.close();
    },
    confirm() {
      const fn = G.runtime.confirmAction;
      G.runtime.confirmAction = null;
      U.close();
      fn?.();
    },
    tutorial() {
      U.tutorial(0);
    },
    tutorialNext() {
      U.tutorial(G.runtime.tutorialStep + 1);
    },
    tutorialDone() {
      S.tutorial.finish();
      U.close();
    },
    welcomeSettings() {
      U.modal('Offline game', '<p>All game files and artwork are local. Choose or create a character to access presentation and audio settings. Saves remain in this browser.</p><div class="row spacer">' + U.btn('Import save', 'import') + U.btn('Reset local save', 'reset', '', 'danger') + '</div>');
    },
    debug(el) {
      G.assert(G.character() && !G.runtime.selecting && G.runtime.commandToolAccess === G.character().id, 'Command unavailable.');
      const command = el.dataset.command;
      if (command === 'reset') {
        actions.reset();
        return;
      }
      if (command === 'export') {
        actions.export();
        return;
      }
      G.ensureIdle();
      const c = G.character();
      c.debugUsed = true;
      if (command === 'level') {
        c.level = G.clamp(Math.floor(Number(value('debug-level')) || 1), 1, 100);
        c.xp = 0;
        if (D.locations[c.location].level > c.level) c.location = 0;
        for (const level of Object.keys(c.perks))
          if (+level > c.level) delete c.perks[level];
        if (!S.talents.valid(c)) c.talents = {};
        c.hp = S.character.stats(c).health;
      }
      if (command === 'skill') {
        const skill = value('debug-skill');
        c.skills[skill] = {
          level: G.clamp(Math.floor(Number(value('debug-skill-level')) || 1), 1, 100),
          xp: 0
        };
      }
      if (command === 'xp') S.xp.add(c, Math.max(0, Number(value('debug-xp')) || 0));
      if (command === 'coins') c.coins += 1000000;
      if (command === 'hp') c.hp = G.clamp(Number(value('debug-hp')) || 0, 0, S.character.stats(c).health);
      if (command === 'item' || command === 'bossItem') S.inventory.reward([S.items.create(+value('debug-tier'), +value('debug-piece'), +value('debug-rarity'), command === 'bossItem' ? +value('debug-boss') : null)]);
      if (command === 'materials') S.inventory.reward([...D.resourceKinds, 'bar', 'food'].map(k => ({
        key: k + ':' + value('debug-tier'),
        quantity: 1000
      })));
      if (command === 'gems') S.inventory.reward(D.gems.slice(0, +value('debug-gem-rank') === 0 ? D.regularGemCount : D.gems.length).map((g, i) => ({
        key: +value('debug-gem-rank') === 0 ? 'uncut:' + i : 'gem:' + i + ':' + value('debug-gem-rank'),
        quantity: 100
      })));
      if (command === 'stones') S.inventory.reward([{
        key: 'stone',
        quantity: 100
      }]);
      if (['regular', 'elite', 'dungeon', 'gather'].includes(command)) {
        G.assert(!c.dungeon, 'Leave the current dungeon first.');
        if (command === 'dungeon') G.assert(D.locations[c.location].dungeon !== null, 'Change to a dungeon location first.');
        S.world.discover(command === 'gather' ? 'Mining' : command);
      }
      if (command === 'death') {
        confirm('Test this character’s death rule?', '<p>Hardcore will be permanently deleted. Hardcore Ironman will permanently convert.</p>', () => S.combat.death(), true);
        return;
      }
      if (command === 'simulate') {
        G.assert(c.encounter?.enemy, 'Force a creature encounter first.');
        const result = S.kernel.simulate(c, c.encounter.enemy);
        G.notify('Simulation: ' + G.percent(result.chance) + ' wins across ' + result.count + ' fights.');
      }
      G.commit();
      if (!['regular', 'elite', 'dungeon', 'gather'].includes(command)) U.debug();
      else U.close();
    }
  };
  document.addEventListener('click', event => {
    if (!G.account.playable()) return;
    const el = event.target.closest('[data-action]');
    if (!el || el.disabled) return;
    try {
      G.audio.unlock();
      const action = el.dataset.action;
      if (!['navigate', 'tab', 'shopSection', 'appearanceOutfit', 'craftQuantity', 'exchangeMax', 'gemGuide', 'gemGuideBack', 'gearPortrait', 'portraitEquipment', 'achievementPage', 'companionPage', 'emporiumPage', 'ascendantHelp', 'regaliaCollection', 'visitEmporium', 'sellCategory', 'trainingDialog', 'activityView', 'mobileMenu', 'mobileWorldView', 'locations', 'location', 'questTravel', 'afkStart', 'afkStop', 'eat', 'rest', 'audioPreview', 'audioPreviewStop', 'closeModal', 'customize', 'appearanceForm', 'appearanceLook', 'appearanceConfirm'].includes(action)) S.afk.stop('Manual control', false);
      actions[el.dataset.action]?.(el);
    } catch (error) {
      G.notify(error.message, 'error');
    }
  });
  document.addEventListener('change', async event => {
    if (!G.account.playable()) return;
    const el = event.target,
      c = G.character();
    try {
      if (el.dataset.preference) {
        S.world.setPreference(el.dataset.preference, el.value);
        if (document.querySelector('.modal .skill-preferences')) {
          if (S.tutorial.active()) U.lesson(); else U.tutorial();
        }
      }
      if (el.id === 'companion-food') {
        G.runtime.companionFoods ??= {};
        G.runtime.companionFoods[c.id] = el.value;
        U.render();
      }
      if (el.id === 'food-select') {
        G.ensureIdle();
        c.food = el.value || null;
        G.commit();
      }
      if (el.id === 'eat-select') {
        G.ensureIdle();
        const n = +el.value;
        G.assert(c.eatUnlocks.includes(n), 'This Auto-Eat tier is not unlocked.');
        c.eat = n;
        G.commit();
      }
      if (el.id === 'leaderboard-category') {
        G.runtime.leaderboard = el.value;
        U.render();
      }
      if (['offline-select', 'lesson-offline-select', 'training-offline-select'].includes(el.id)) {
        S.offline.select(el.value || null);
      }
      if (el.id === 'title-select') {
        c.title = el.value;
        G.commit();
      }
      if (el.id === 'inventory-sort') {
        G.runtime.sort = el.value;
        U.render();
      }
      if (el.id === 'inventory-kind') {
        G.runtime.inventoryKinds ??= {};
        G.runtime.inventoryKinds[el.dataset.category] = el.value;
        U.render();
      }
      if (el.id === 'regalia-filter') { G.runtime.regaliaGroup=el.value; G.runtime.emporiumPage=0; U.render(); }
      if (el.id === 'box-gem-type') { G.runtime.boxGemType=el.value; U.render(); }
      if (el.id === 'box-gem-rank') { G.runtime.boxGemRank=el.value; U.render(); }
      if (el.id === 'shop-region') { G.runtime.shopRegion=Number(el.value);G.runtime.shopMaterialTier=null;U.render(); }
      if (el.id === 'shop-material-tier') { G.runtime.shopMaterialTier=Number(el.value);U.render(); }
      if (['exchange-from','exchange-to','exchange-tier'].includes(el.id)) {
        const f=G.runtime.exchange,key=el.id.slice(9);f[key]=key==='tier'?Number(el.value):el.value;U.render();
      }
      if (el.id === 'smithing-category') {
        G.runtime.smithingCategory = el.value;
        U.render();
      }
      if (el.id === 'armor-class') { G.runtime.armorClass=el.value; U.render(); }
      if (el.id === 'import-source') { G.assert(G.runtime.importDraft,'Choose a save file first.'); U.importSlots(G.runtime.importDraft.text,Number(el.value)); }
      if (el.id === 'craft-tier') {
        G.runtime.craftTier = +el.value;
        U.render();
      }
      if (el.id === 'gem-filter') {
        G.runtime.gemFilter = +el.value;
        U.render();
      }
      if (el.dataset.afk) {
        if(el.dataset.afkPercent)G.assert(el.value.trim()!==''&&el.validity.valid,'Enter a percentage from 0 to 100.');
        S.afk.configure(el.dataset.afk, el.type === 'checkbox' ? el.checked : Number(el.value)/(el.dataset.afkPercent?100:1));
      }
      if (el.dataset.setting) {
        G.state.settings[el.dataset.setting] = el.type === 'checkbox' ? el.checked : +el.value;
        U.applySettings();
        G.audio.sync();
        G.save.write();
      }
      if (el.id === 'import-file') {
        const file = el.files[0];
        if (file) {
          G.assert(file.size < 10000000, 'Save file is too large.');
          document.getElementById('import-text').value = await file.text();
        }
      }
    } catch (error) {
      G.notify(error.message, 'error');
    }
  });
  document.addEventListener('input', event => {
    if (!G.account.playable()) return;
    const el = event.target;
    if (el.id==='exchange-quantity') U.exchangeLive();
    if (el.id === 'appearance-color') {
      G.runtime.appearanceDraft.color = el.value;
      document.querySelector('.customize-preview')?.style.setProperty('--cloak', el.value);
    }
    if (el.id === 'buy-quantity') {
      const item = D.shop.find(i => i.id === G.runtime.buyItem), label = document.getElementById('buy-total');
      if (item && label) label.textContent = G.money(item.price * (Number(el.value) || 0));
    }
    if (el.id === 'sell-quantity') {
      const item = S.items.find(G.runtime.sellItem);
      const label = document.getElementById('sell-total');
      if (item && label) label.textContent = G.money(S.shop.value(item) * (Number(el.value) || 0));
    }
    if (el.id === 'inventory-search') {
      const cursor = el.selectionStart;
      G.runtime.search = el.value;
      U.render();
      const next = document.getElementById('inventory-search');
      next?.focus();
      next?.setSelectionRange(cursor, cursor);
    }
    if (el.dataset.setting) {
      const label = document.getElementById('setting-label-' + el.dataset.setting);
      if (label) label.textContent = el.value + '%';
    }
    if (el.classList.contains('market-filter')) document.getElementById('market-results').textContent = 'Filters updated. No online listings are available in this offline build.';
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'command-form') return;
    event.preventDefault();
    if (!G.account.playable()) return;
    const input = document.getElementById('command-input'), c = G.character();
    if (input.value.trim() === 'command_tool_developer_access' && c && !G.runtime.selecting) {
      G.runtime.commandToolAccess = c.id;
      U.debug();
      return;
    }
    input.setAttribute('aria-invalid', 'true');
    document.getElementById('command-feedback').textContent = 'Command not recognized.';
    input.focus();
  });
  document.addEventListener('keydown', e => {
    if (!G.account.playable()) return;
    const editing = e.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]');
    if (e.key === '/' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.repeat && !e.isComposing && !editing && !document.querySelector('.modal') && G.character() && !G.runtime.selecting) {
      e.preventDefault();
      U.commandPanel();
    }
    if (e.key === 'Escape') U.close();
    if (e.key === 'Tab' && document.querySelector('.modal')) {
      const nodes = [...document.querySelectorAll('.modal button:not(:disabled),.modal input,.modal select,.modal textarea')].filter(n => n.offsetParent !== null);
      const first = nodes[0],
        last = nodes.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  });
  window.addEventListener('rpg:notice', ({
    detail
  }) => {
    if (!G.state.settings.notifications && !['error', 'warning'].includes(detail.type)) return;
    const div = document.createElement('div');
    div.className = 'toast ' + detail.type;
    div.textContent = detail.message;
    document.getElementById('toasts').append(div);
    while (document.getElementById('toasts').children.length > 3) document.getElementById('toasts').firstElementChild.remove();
    setTimeout(() => div.remove(), detail.type === 'error' ? 9000 : 5000);
  });
  window.addEventListener('rpg:change', () => U.render());
  window.addEventListener('rpg:saved', () => {
    const label = document.getElementById('save-status'),
      time = document.getElementById('save-time');
    if (label) label.textContent = G.save.status;
    if (time) time.textContent = new Date(G.state.savedAt).toLocaleTimeString();
  });
  let lootTimer;
  window.addEventListener('rpg:loot', ({
    detail
  }) => {
    const el = document.getElementById('loot-popup');
    const highlight = detail.rewards.filter(r => r.kind === 'gear' || r.kind === 'tool').reduce((best, r) => !best || r.rarity > best.rarity ? r : best, null);
    el.innerHTML = (highlight && highlight.rarity >= 2 ? '<span class="loot-rarity eyebrow">' + D.rarity[highlight.rarity] + (highlight.kind === 'tool' ? ' tool' : ' gear') + ' found</span>' : '') + '<strong>' + U.e(detail.label) + '</strong><p>' + detail.rewards.map(U.rewardText).join('<br>') + '</p><small>Automatically collected · click to dismiss</small>';
    el.hidden = false;
    clearTimeout(lootTimer);
    lootTimer = setTimeout(() => el.hidden = true, D.config.lootMs);
  });
  document.getElementById('loot-popup').onclick = () => document.getElementById('loot-popup').hidden = true;
  window.addEventListener('rpg:strike', ({
    detail: e
  }) => {
    G.audio.play(e.food || e.recovery ? 'heal' : e.miss ? 'miss' : e.critical ? 'crit' : 'hit', e);
    if (!G.state.settings.damage) return;
    const show = healing => {
      const el = document.createElement('span');
      el.className = 'damage-float ' + e.side + (!healing && e.critical ? ' critical' : '') + (healing ? ' heal' : '');
      el.textContent = healing ? '+' + G.number(e.healing, 2) + ' HP' : e.miss ? 'MISS' : G.number(e.damage, 1);
      if (healing) {
        const fighter = document.getElementById(e.side + '-fighter');
        if (fighter) {
          const box = fighter.getBoundingClientRect();
          el.style.left = (box.left + box.width / 2) + 'px';
          const existing = document.querySelectorAll('.damage-float.' + e.side + '.heal').length;
          el.style.top = (box.bottom - 25 - existing * 28) + 'px';
          el.style.transform = 'translateX(-50%)';
        }
      }
      document.getElementById('floating').append(el);
      setTimeout(() => el.remove(), 1100);
    };
    if (!e.food && !e.recovery) show(false);
    if (e.healing > 0) show(true);
  });
  const bootstrap = () => {
    G.save.load();
    G.runtime.selecting = G.state.slots.some(Boolean);
    G.runtime.needsResume = G.runtime.selecting && !G.runtime.loadFailure;
    U.render();
  };
  if (G.account.enabled) G.account.start(bootstrap);
  else bootstrap();
  let last = performance.now(),
    saveElapsed = 0;
  setInterval(() => {
    const now = performance.now(),
      ms = Math.min(1000, now - last);
    last = now;
    if (document.hidden || G.runtime.selecting || G.runtime.loadFailure || !G.account.playable()) return;
    try {
      const c = G.character();
      if (c) {
        S.companions.sync(c);
        if (S.quests.sync(c)) G.commit();
        S.afk.tick(ms);
        if (c.combat) S.combat.tick(ms / 1000);
        else S.world.tick(ms);
        U.live();
        saveElapsed += ms;
        if (saveElapsed >= 2000) {
          saveElapsed = 0;
          G.save.write();
        }
      }
    } catch (error) {
      S.afk.stop('Action error', false);
      G.notify('Action paused: ' + error.message, 'error');
      if (G.character()) G.character().activity = null;
    }
  }, 100);
  let animationAt = performance.now();
  const animate = now => {
    const c = G.character();
    if (!document.hidden && c && !G.runtime.selecting && !G.runtime.loadFailure && G.account.playable()) {
      const elapsed = Math.min(100, now - last);
      if (c.activity && !c.pending.length) {
        const a = c.activity,
          bar = document.getElementById('activity-bar');
        if (bar) bar.style.width = G.clamp((a.elapsed + elapsed) / a.duration * 100, 0, 100) + '%';
      }
      if (c.combat)
        for (const who of ['player', 'enemy']) {
          const f = c.combat,
            bar = document.getElementById(who + '-timer'),
            next = who === 'player' ? f.nextPlayer : f.nextEnemy;
          if (bar) bar.style.width = G.clamp((1 - (next - f.time - elapsed / 1000) / f[who].interval) * 100, 0, 100) + '%';
        }
    }
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
  document.addEventListener('visibilitychange', () => {
    if (G.runtime.selecting || G.runtime.loadFailure || !G.account.playable()) return;
    if (document.hidden) {
      if (G.character() && !G.runtime.selecting) G.character().lastSeen = Date.now();
      G.save.write();
    } else {
      last = performance.now();
      if (G.character()) {
        const r = S.offline.apply(G.character());
        if (r.levelsGained) S.offline.record(r);
        else if (r.xp > 0) G.notify('Offline ' + r.skill + ': +' + G.number(r.xp) + ' XP.');
        G.commit();
        showOffline();
      }
    }
  });
  window.addEventListener('pagehide', () => {
    if (!G.runtime.loadFailure) {
      if (G.character() && !G.runtime.selecting) G.character().lastSeen = Date.now();
      G.save.write();
      if (G.account.enabled) G.account.flush(true);
    }
  });
})(RPG, RPG.data, RPG.systems, RPG.ui);
