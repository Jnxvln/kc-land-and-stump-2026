import { deleteObjects, getObject, putObject } from "../src/server/storage";

const key = `smoke-test/${Date.now()}.txt`;

await putObject(key, Buffer.from("hello from kc-land-and-stump"), "text/plain");
console.log("Uploaded:", key);

const result = await getObject(key);
console.log("Read back:", await result.Body?.transformToString());

await deleteObjects([key]);
console.log("Deleted. Storage is working.");