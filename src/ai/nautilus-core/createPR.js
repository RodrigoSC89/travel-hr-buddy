import { Octokit } from "octokit";

/**
 * Cria uma Pull Request automática com base nas sugestões do Nautilus Intelligence Core
 */
export async function createAutoPR(title, body) {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const branchName = `ai/autofix-${Date.now()}`;

  try {
    await octokit.request("POST /repos/{owner}/{repo}/git/refs", {
      owner: "RodrigoSC89",
      repo: "travel-hr-buddy",
      ref: `refs/heads/${branchName}`,
      sha: process.env.GITHUB_SHA,
    });

    await octokit.request("POST /repos/{owner}/{repo}/pulls", {
      owner: "RodrigoSC89",
      repo: "travel-hr-buddy",
      title,
      head: branchName,
      base: "main",
      body,
    });

    console.log(`🚀 Pull Request criada automaticamente: ${title}`);
  } catch (error) {
    console.error("Falha ao criar PR automática:", error);
  }
}
