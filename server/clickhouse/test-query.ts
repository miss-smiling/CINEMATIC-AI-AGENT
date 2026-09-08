import { findInvalidShotEntityLinks } from "./queries.ts";

const invalidLinks = await findInvalidShotEntityLinks();

console.log("Invalid shot-entity links:");
console.log(invalidLinks);