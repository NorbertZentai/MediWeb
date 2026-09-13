const fs = require("fs");
const path = require("path");

const dockerfilePath = path.join(__dirname, "..", "..", "..", "Dockerfile");

// Note: render.yaml is a deployment file the pipeline must not modify or
// assert on (operator decision on issue #47). The REACT_APP_API_URL ->
// EXPO_PUBLIC_API_URL rename there is handled by the operator separately
// before ai/demo is released to master.
describe("deploy config", () => {
  it("Dockerfile uses node:22-alpine and no longer references node:18", () => {
    const dockerfile = fs.readFileSync(dockerfilePath, "utf8");
    expect(dockerfile).toContain("node:22-alpine");
    expect(dockerfile).not.toContain("node:18");
  });
});
