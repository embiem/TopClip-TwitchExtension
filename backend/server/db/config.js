const password = "bP7jsZNpQVWzGtnN";

export const getUri = ({ dbName }) =>
  `mongodb://drawtastic-admin:${encodeURIComponent(
    password
  )}@cluster-drawtastic-shard-00-00-nn4va.mongodb.net:27017,cluster-drawtastic-shard-00-01-nn4va.mongodb.net:27017,cluster-drawtastic-shard-00-02-nn4va.mongodb.net:27017/${dbName}?ssl=true&replicaSet=cluster-drawtastic-shard-0&authSource=admin`;
