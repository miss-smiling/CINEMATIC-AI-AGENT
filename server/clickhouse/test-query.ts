import { findDuplicateShotEntityLinks } from "./queries.ts";

const duplicates = await findDuplicateShotEntityLinks();

console.log("Duplicate shot-entity links:");
console.log(duplicates);