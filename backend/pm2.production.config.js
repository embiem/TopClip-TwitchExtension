module.exports = {
  apps: [{
    name: "topclip-ebs",
    script: "index.js",
    watch: false,
    "instances": "max",
    "exec_mode": "cluster",
    env: {
      "NODE_ENV": "production",
    }
  }]
}