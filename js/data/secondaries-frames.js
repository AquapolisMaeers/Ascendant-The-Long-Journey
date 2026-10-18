'use strict';
// Measured sprite viewports; generated raster pixels are unchanged.
(function(D) {
  const sheets={"assets/art/items/secondaries.png":{"size":[1254,1254],"frames":[[42,5,139,135],[250,4,136,134],[452,3,137,138],[669,0,121,143],[871,1,121,144],[1076,0,123,143],[34,139,151,148],[245,137,144,153],[454,140,142,150],[664,142,132,151],[858,144,157,148],[1073,142,142,147],[31,286,158,159],[237,289,160,156],[452,289,153,155],[660,293,143,151],[866,291,147,154],[1105,288,89,159],[20,444,167,110],[224,444,187,107],[430,443,189,110],[635,443,194,109],[843,444,188,108],[1050,446,188,106],[18,555,171,116],[215,552,186,110],[421,552,192,116],[632,553,182,115],[839,554,193,114],[1047,553,187,111],[15,670,178,117],[208,668,194,119],[416,670,194,117],[631,669,191,117],[833,667,196,120],[1080,663,148,132],[21,793,166,134],[228,793,165,136],[439,794,160,134],[646,794,161,135],[853,794,163,136],[1059,794,165,134],[15,926,170,147],[223,928,168,146],[436,927,165,147],[643,928,165,149],[851,929,168,147],[1059,927,167,150],[16,1072,170,160],[220,1074,173,159],[430,1073,174,162],[638,1076,172,158],[848,1075,172,160]],"clips":[null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null]}};
  for(const art of Object.values(D.itemIllustrations)){
    const sheet=sheets[art.file];if(!sheet)continue;
    art.frame=sheet.frames[art.index];art.size=sheet.size;art.clip=sheet.clips[art.index];art.version='secondaries-framed-v1';
  }
})(RPG.data);
