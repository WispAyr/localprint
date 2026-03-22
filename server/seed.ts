import pool from "./db";

async function seed() {
  const userId = "79c8dd80-7db0-4a1e-8992-05693a41ba41";

  // Design 1: Van 1 - Big Alex
  const design1 = {
    form: {
      location: "Ayr, South Ayrshire, Scotland",
      latitude: "55.4610", longitude: "-4.6293", distance: "15000",
      width: "21", height: "29.7", theme: "midnight-blue", layout: "a4-portrait",
      displayCity: "Van 1 - Big Alex", displayCountry: "Weekly Schedule",
      displayContinent: "Europe", fontFamily: "", showPosterText: true,
      includeCredits: true, includeBuildings: false, includeWater: true,
      includeParks: true, includeAeroway: false, includeRail: true,
      includeRoads: true, includeRoadPath: true, includeRoadMinorLow: true,
      includeRoadOutline: true, showMarkers: true
    },
    business: {
      businessName: "Joanna's Chippy Van", tagline: "Van 1 - Big Alex",
      address: "", showBusinessMarker: false
    },
    markers: [
      {id:"m1",lat:55.458,lon:-4.615,label:"Moorfield - Tue 5-6pm",color:"#e74c3c",size:24,iconId:"pin"},
      {id:"m2",lat:55.453,lon:-4.628,label:"John Walker Dr - Tue 6:15-7pm",color:"#e74c3c",size:24,iconId:"pin"},
      {id:"m3",lat:55.469,lon:-4.605,label:"Alton Hill - Tue 7:15-8pm",color:"#e74c3c",size:24,iconId:"pin"},
      {id:"m4",lat:55.445,lon:-4.563,label:"Mossblown - Wed 4:30-5:30pm",color:"#f39c12",size:24,iconId:"pin"},
      {id:"m5",lat:55.420,lon:-4.570,label:"Annbank - Wed 5:40-7pm",color:"#f39c12",size:24,iconId:"pin"},
      {id:"m6",lat:55.471,lon:-4.294,label:"Auchinleck - Thu 5-7pm",color:"#2ecc71",size:24,iconId:"pin"},
      {id:"m7",lat:55.447,lon:-4.537,label:"Monkton - Fri 4:30-6pm",color:"#3498db",size:24,iconId:"pin"},
      {id:"m8",lat:55.511,lon:-4.567,label:"Symington - Fri 6:30-7:30pm",color:"#3498db",size:24,iconId:"pin"},
      {id:"m9",lat:55.396,lon:-4.179,label:"New Cumnock - Sat 5-7pm",color:"#9b59b6",size:24,iconId:"pin"},
      {id:"m10",lat:55.461,lon:-4.623,label:"Highpark Ave - Sat 7:15-8pm",color:"#9b59b6",size:24,iconId:"pin"},
      {id:"m11",lat:55.604,lon:-4.471,label:"Fenwick - Sun 5-7pm",color:"#e67e22",size:24,iconId:"pin"}
    ],
    customColors: {}
  };

  // Design 2: Van 3 - Chris
  const design2 = {
    form: {
      location: "Irvine, North Ayrshire, Scotland",
      latitude: "55.6100", longitude: "-4.6700", distance: "12000",
      width: "21", height: "29.7", theme: "midnight-blue", layout: "a4-portrait",
      displayCity: "Van 3 - Chris", displayCountry: "Weekly Schedule",
      displayContinent: "Europe", fontFamily: "", showPosterText: true,
      includeCredits: true, includeBuildings: false, includeWater: true,
      includeParks: true, includeAeroway: false, includeRail: true,
      includeRoads: true, includeRoadPath: true, includeRoadMinorLow: true,
      includeRoadOutline: true, showMarkers: true
    },
    business: {
      businessName: "Joanna's Chippy Van", tagline: "Van 3 - Chris",
      address: "", showBusinessMarker: false
    },
    markers: [
      {id:"m1",lat:55.602,lon:-4.675,label:"Bourtreehill - Tue 5-7pm",color:"#2ecc71",size:24,iconId:"pin"},
      {id:"m2",lat:55.708,lon:-4.719,label:"Dalry - Wed 4:30-6pm",color:"#f39c12",size:24,iconId:"pin"},
      {id:"m3",lat:55.751,lon:-4.631,label:"Beith - Wed 6:30-8pm",color:"#f39c12",size:24,iconId:"pin"},
      {id:"m4",lat:55.635,lon:-4.786,label:"Saltcoats - Thu 4:30-6pm",color:"#3498db",size:24,iconId:"pin"},
      {id:"m5",lat:55.644,lon:-4.813,label:"Ardrossan - Thu 6:30-8pm",color:"#3498db",size:24,iconId:"pin"},
      {id:"m6",lat:55.656,lon:-4.706,label:"Whitehurst Park - Fri 4:30-6pm",color:"#e74c3c",size:24,iconId:"pin"},
      {id:"m7",lat:55.648,lon:-4.689,label:"Pennyburn - Fri 6:30-8pm",color:"#e74c3c",size:24,iconId:"pin"},
      {id:"m8",lat:55.616,lon:-4.660,label:"Castlepark - Sat 4:30-6pm",color:"#9b59b6",size:24,iconId:"pin"},
      {id:"m9",lat:55.598,lon:-4.647,label:"Turnpike Way - Sat 6:30-8pm",color:"#9b59b6",size:24,iconId:"pin"},
      {id:"m10",lat:55.633,lon:-4.755,label:"Stevenston Top - Sun 4:30-6pm",color:"#e67e22",size:24,iconId:"pin"},
      {id:"m11",lat:55.628,lon:-4.760,label:"Stevenston Bottom - Sun 6:30-8pm",color:"#e67e22",size:24,iconId:"pin"}
    ],
    customColors: {}
  };

  // Design 3: All Vans Overview
  const design3 = {
    form: {
      location: "Ayrshire, Scotland",
      latitude: "55.5200", longitude: "-4.5500", distance: "25000",
      width: "21", height: "29.7", theme: "midnight-blue", layout: "a4-portrait",
      displayCity: "Joanna's Chippy Van", displayCountry: "All Vans — Weekly Overview",
      displayContinent: "Europe", fontFamily: "", showPosterText: true,
      includeCredits: true, includeBuildings: false, includeWater: true,
      includeParks: true, includeAeroway: false, includeRail: true,
      includeRoads: true, includeRoadPath: true, includeRoadMinorLow: true,
      includeRoadOutline: true, showMarkers: true
    },
    business: {
      businessName: "Joanna's Chippy Van", tagline: "All Vans — Weekly Schedule",
      address: "Serving Ayrshire", showBusinessMarker: false
    },
    markers: [
      // Van 1 - Big Alex (red)
      {id:"a1",lat:55.458,lon:-4.615,label:"Moorfield (Alex) Tue",color:"#e74c3c",size:20,iconId:"pin"},
      {id:"a2",lat:55.453,lon:-4.628,label:"John Walker Dr (Alex) Tue",color:"#e74c3c",size:20,iconId:"pin"},
      {id:"a3",lat:55.469,lon:-4.605,label:"Alton Hill (Alex) Tue",color:"#e74c3c",size:20,iconId:"pin"},
      {id:"a4",lat:55.445,lon:-4.563,label:"Mossblown (Alex) Wed",color:"#e74c3c",size:20,iconId:"pin"},
      {id:"a5",lat:55.420,lon:-4.570,label:"Annbank (Alex) Wed",color:"#e74c3c",size:20,iconId:"pin"},
      {id:"a6",lat:55.471,lon:-4.294,label:"Auchinleck (Alex) Thu",color:"#e74c3c",size:20,iconId:"pin"},
      {id:"a7",lat:55.447,lon:-4.537,label:"Monkton (Alex) Fri",color:"#e74c3c",size:20,iconId:"pin"},
      {id:"a8",lat:55.511,lon:-4.567,label:"Symington (Alex) Fri",color:"#e74c3c",size:20,iconId:"pin"},
      {id:"a9",lat:55.396,lon:-4.179,label:"New Cumnock (Alex) Sat",color:"#e74c3c",size:20,iconId:"pin"},
      {id:"a10",lat:55.461,lon:-4.623,label:"Highpark Ave (Alex) Sat",color:"#e74c3c",size:20,iconId:"pin"},
      {id:"a11",lat:55.604,lon:-4.471,label:"Fenwick (Alex) Sun",color:"#e74c3c",size:20,iconId:"pin"},
      // Van 3 - Chris (green)
      {id:"c1",lat:55.602,lon:-4.675,label:"Bourtreehill (Chris) Tue",color:"#2ecc71",size:20,iconId:"pin"},
      {id:"c2",lat:55.708,lon:-4.719,label:"Dalry (Chris) Wed",color:"#2ecc71",size:20,iconId:"pin"},
      {id:"c3",lat:55.751,lon:-4.631,label:"Beith (Chris) Wed",color:"#2ecc71",size:20,iconId:"pin"},
      {id:"c4",lat:55.635,lon:-4.786,label:"Saltcoats (Chris) Thu",color:"#2ecc71",size:20,iconId:"pin"},
      {id:"c5",lat:55.644,lon:-4.813,label:"Ardrossan (Chris) Thu",color:"#2ecc71",size:20,iconId:"pin"},
      {id:"c6",lat:55.656,lon:-4.706,label:"Whitehurst (Chris) Fri",color:"#2ecc71",size:20,iconId:"pin"},
      {id:"c7",lat:55.648,lon:-4.689,label:"Pennyburn (Chris) Fri",color:"#2ecc71",size:20,iconId:"pin"},
      {id:"c8",lat:55.616,lon:-4.660,label:"Castlepark (Chris) Sat",color:"#2ecc71",size:20,iconId:"pin"},
      {id:"c9",lat:55.598,lon:-4.647,label:"Turnpike Way (Chris) Sat",color:"#2ecc71",size:20,iconId:"pin"},
      {id:"c10",lat:55.633,lon:-4.755,label:"Stevenston Top (Chris) Sun",color:"#2ecc71",size:20,iconId:"pin"},
      {id:"c11",lat:55.628,lon:-4.760,label:"Stevenston Bottom (Chris) Sun",color:"#2ecc71",size:20,iconId:"pin"}
    ],
    customColors: {}
  };

  await pool.query("INSERT INTO designs (user_id, name, description, state) VALUES ($1, $2, $3, $4)",
    [userId, "Van 1 - Big Alex — Weekly Schedule", "South Ayrshire stops for Van 1", JSON.stringify(design1)]);
  await pool.query("INSERT INTO designs (user_id, name, description, state) VALUES ($1, $2, $3, $4)",
    [userId, "Van 3 - Chris — Weekly Schedule", "North Ayrshire stops for Van 3", JSON.stringify(design2)]);
  await pool.query("INSERT INTO designs (user_id, name, description, state) VALUES ($1, $2, $3, $4)",
    [userId, "All Vans — Weekly Overview", "All van stops across Ayrshire, colour-coded", JSON.stringify(design3)]);

  console.log("Seeded 3 designs for Joanna's Chippy Van");
  const res = await pool.query("SELECT id, name FROM designs WHERE user_id = $1", [userId]);
  console.table(res.rows);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
