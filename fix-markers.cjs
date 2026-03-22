const { Pool } = require("pg");
const pool = new Pool({ host: "127.0.0.1", database: "localprint", user: "localprint", password: "localprint123" });

const van1Markers = [
  {id:"m1",lat:55.458,lon:-4.615,title:"Moorfield",subtitle:"Dumfries Drive",day:"Tuesday",time:"5pm - 6pm",label:"Moorfield - Tue 5-6pm",color:"#e74c3c",size:24,iconId:"van"},
  {id:"m2",lat:55.453,lon:-4.628,title:"John Walker Drive",subtitle:"",day:"Tuesday",time:"6:15pm - 7pm",label:"John Walker Dr - Tue 6:15-7pm",color:"#e74c3c",size:24,iconId:"van"},
  {id:"m3",lat:55.469,lon:-4.605,title:"Alton Hill",subtitle:"Woodhill Road",day:"Tuesday",time:"7:15pm - 8pm",label:"Alton Hill - Tue 7:15-8pm",color:"#e74c3c",size:24,iconId:"van"},
  {id:"m4",lat:55.445,lon:-4.563,title:"Mossblown",subtitle:"Old Library",day:"Wednesday",time:"4:30pm - 5:30pm",label:"Mossblown - Wed 4:30-5:30pm",color:"#f39c12",size:24,iconId:"van"},
  {id:"m5",lat:55.420,lon:-4.570,title:"Annbank",subtitle:"Weston Avenue",day:"Wednesday",time:"5:40pm - 7pm",label:"Annbank - Wed 5:40-7pm",color:"#f39c12",size:24,iconId:"van"},
  {id:"m6",lat:55.471,lon:-4.294,title:"Auchinleck",subtitle:"Indoor Bowling Club",day:"Thursday",time:"5pm - 7pm",label:"Auchinleck - Thu 5-7pm",color:"#2ecc71",size:24,iconId:"van"},
  {id:"m7",lat:55.447,lon:-4.537,title:"Monkton",subtitle:"at the Nursery",day:"Friday",time:"4:30pm - 6pm",label:"Monkton - Fri 4:30-6pm",color:"#3498db",size:24,iconId:"van"},
  {id:"m8",lat:55.511,lon:-4.567,title:"Symington",subtitle:"at the Co-op",day:"Friday",time:"6:30pm - 7:30pm",label:"Symington - Fri 6:30-7:30pm",color:"#3498db",size:24,iconId:"van"},
  {id:"m9",lat:55.396,lon:-4.179,title:"New Cumnock",subtitle:"Swimming Pool",day:"Saturday",time:"5pm - 7pm",label:"New Cumnock - Sat 5-7pm",color:"#9b59b6",size:24,iconId:"van"},
  {id:"m10",lat:55.461,lon:-4.623,title:"Highpark Avenue",subtitle:"",day:"Saturday",time:"7:15pm - 8pm",label:"Highpark Ave - Sat 7:15-8pm",color:"#9b59b6",size:24,iconId:"van"},
  {id:"m11",lat:55.604,lon:-4.471,title:"Fenwick",subtitle:"Main Street",day:"Sunday",time:"5pm - 7pm",label:"Fenwick - Sun 5-7pm",color:"#e67e22",size:24,iconId:"van"}
];

const van3Markers = [
  {id:"m1",lat:55.602,lon:-4.675,title:"Bourtreehill",subtitle:"Crofthead Court",day:"Tuesday",time:"5pm - 7pm",label:"Bourtreehill - Tue 5-7pm",color:"#2ecc71",size:24,iconId:"van"},
  {id:"m2",lat:55.708,lon:-4.719,title:"Dalry",subtitle:"Community Centre",day:"Wednesday",time:"4:30pm - 6pm",label:"Dalry - Wed 4:30-6pm",color:"#f39c12",size:24,iconId:"van"},
  {id:"m3",lat:55.751,lon:-4.631,title:"Beith",subtitle:"",day:"Wednesday",time:"6:30pm - 8pm",label:"Beith - Wed 6:30-8pm",color:"#f39c12",size:24,iconId:"van"},
  {id:"m4",lat:55.635,lon:-4.786,title:"Saltcoats",subtitle:"Glenbanks Road",day:"Thursday",time:"4:30pm - 6pm",label:"Saltcoats - Thu 4:30-6pm",color:"#3498db",size:24,iconId:"van"},
  {id:"m5",lat:55.644,lon:-4.813,title:"Ardrossan",subtitle:"Stanley Road",day:"Thursday",time:"6:30pm - 8pm",label:"Ardrossan - Thu 6:30-8pm",color:"#3498db",size:24,iconId:"van"},
  {id:"m6",lat:55.656,lon:-4.706,title:"Whitehurst Park",subtitle:"Kilwinning",day:"Friday",time:"4:30pm - 6pm",label:"Whitehurst Park - Fri 4:30-6pm",color:"#e74c3c",size:24,iconId:"van"},
  {id:"m7",lat:55.648,lon:-4.689,title:"Pennyburn",subtitle:"Kilwinning",day:"Friday",time:"6:30pm - 8pm",label:"Pennyburn - Fri 6:30-8pm",color:"#e74c3c",size:24,iconId:"van"},
  {id:"m8",lat:55.616,lon:-4.660,title:"Castlepark",subtitle:"Community Centre",day:"Saturday",time:"4:30pm - 6pm",label:"Castlepark - Sat 4:30-6pm",color:"#9b59b6",size:24,iconId:"van"},
  {id:"m9",lat:55.598,lon:-4.647,title:"Turnpike Way",subtitle:"Montgomerie Park",day:"Saturday",time:"6:30pm - 8pm",label:"Turnpike Way - Sat 6:30-8pm",color:"#9b59b6",size:24,iconId:"van"},
  {id:"m10",lat:55.633,lon:-4.755,title:"Stevenston",subtitle:"Top End",day:"Sunday",time:"4:30pm - 6pm",label:"Stevenston Top - Sun 4:30-6pm",color:"#e67e22",size:24,iconId:"van"},
  {id:"m11",lat:55.628,lon:-4.760,title:"Stevenston",subtitle:"Bottom End",day:"Sunday",time:"6:30pm - 8pm",label:"Stevenston Bottom - Sun 6:30-8pm",color:"#e67e22",size:24,iconId:"van"}
];

// All vans combined
const allMarkers = [
  ...van1Markers.map(m => ({...m, id: "a"+m.id.slice(1), label: m.title+" (Alex) "+m.day.slice(0,3), color:"#e74c3c", size:20})),
  ...van3Markers.map(m => ({...m, id: "c"+m.id.slice(1), label: m.title+" (Chris) "+m.day.slice(0,3), color:"#2ecc71", size:20}))
];

async function run() {
  await pool.query("UPDATE designs SET state = jsonb_set(state, '{markers}', $1::jsonb) WHERE name LIKE 'Van 1%'", [JSON.stringify(van1Markers)]);
  await pool.query("UPDATE designs SET state = jsonb_set(state, '{markers}', $1::jsonb) WHERE name LIKE 'Van 3%'", [JSON.stringify(van3Markers)]);
  await pool.query("UPDATE designs SET state = jsonb_set(state, '{markers}', $1::jsonb) WHERE name LIKE 'All Vans%'", [JSON.stringify(allMarkers)]);
  
  const res = await pool.query("SELECT name, jsonb_array_length(state->'markers') as cnt, state->'markers'->0->>'iconId' as icon, state->'markers'->0->>'title' as title, state->'markers'->0->>'day' as day FROM designs");
  console.table(res.rows);
  await pool.end();
}
run();
