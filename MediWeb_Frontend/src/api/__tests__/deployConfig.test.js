const fs = require("fs");
const path = require("path");

const dockerfilePath = path.join(__dirname, "..", "..", "..", "Dockerfile");
const renderYamlPath = path.join(__dirname, "..", "..", "..", "..", "render.yaml");

describe("deploy config", () => {
  it("Dockerfile uses node:22-alpine and no longer references node:18", () => {
    const dockerfile = fs.readFileSync(dockerfilePath, "utf8");
    expect(dockerfile).toContain("node:22-alpine");
    expect(dockerfile).not.toContain("node:18");
  });

  it("render.yaml sets EXPO_PUBLIC_API_URL for the frontend service and drops REACT_APP_API_URL", () => {
    const renderYaml = fs.readFileSync(renderYamlPath, "utf8");
    expect(renderYaml).toContain("EXPO_PUBLIC_API_URL");
    expect(renderYaml).not.toContain("REACT_APP_API_URL");
  });
});
