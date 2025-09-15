/**
 * This script generates a commit message based on the current changes in the repository.
 * It uses the `generateCommitMessage` function from `./tools.ts` to achieve this.
 */
import { generateCommitMessage } from "./tools";

/**
 * The root directory of the repository. `process.cwd()` returns the current working directory.
 */
const rootDir = process.cwd();

// Call the function to generate the commit message and then log it to the console.
generateCommitMessage({ rootDir }).then((message) => {
  console.log("\nSuggested commit message:\n");
  console.log(message);
});
