const admin = require("./config/firebase");
require("dotenv").config();

const {
  ApolloServer,
  ApolloError,
  ValidationError,
  gql
} = require("apollo-server");

const typeDefs = gql`
  # A User
  type User {
    id: ID!
    username: String!
    posts: [Posts]!
  }
  # A Post Object
  type Posts {
    id: ID!
    title: String!
    body: String!
    user_id: String!
    user: User!
  }
  type Query {
    user(id: String!): User
    users: [User]
    post(id: String!): Posts
    posts: [Posts]
  }
`;

const resolvers = {
  Query: {
    async user(_, args) {
      try {
        const userDoc = await admin
          .firestore()
          .doc(`users/${args.id}`)
          .get();
        const user = userDoc.data();
        return user || new ValidationError("User ID not found");
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async users() {
      const users = await admin
        .firestore()
        .collection("users")
        .get();
      return users.docs.map(user => user.data());
    },
    async post(_, args) {
      try {
        const postDoc = await admin
          .firestore()
          .doc(`posts/${args.id}`)
          .get();
        const post = postDoc.data();
        return post || new ValidationError("Post ID not found");
      } catch (error) {
        throw new ApolloError(error);
      }
    },
    async posts() {
      const posts = await admin
        .firestore()
        .collection("posts")
        .get();
      return posts.docs.map(post => post.data());
    }
  },
  User: {
    async posts(user) {
      try {
        const userPost = await admin
          .firestore()
          .collection("posts")
          .where("user_id", "==", user.id)
          .get();
        return userPost.docs.map(post => post.data());
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  },
  Posts: {
    async user(post) {
      try {
        const postAuthor = await admin
          .firestore()
          .doc(`users/${post.user_id}`)
          .get();
        return postAuthor.data();
      } catch (error) {
        throw new ApolloError(error);
      }
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  engine: {
    apiKey: process.env.ENGINE_API_KEY
  },
  introspection: true
});

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
