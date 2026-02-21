const s = require('superjson');
const response = {"json":{"userId":"test","sessionKey":[1,2,3]},"meta":{"values":{"sessionKey":[["typed-array","Uint8Array"]]},"v":1}};
try { console.log("default:", s.default.deserialize(response)); } catch(e) { console.log("default failed:", e.message); }
try { console.log("named:", s.deserialize(response)); } catch(e) { console.log("named failed:", e.message); }
