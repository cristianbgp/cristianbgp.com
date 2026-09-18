// Fixed public examples supplied for the article, not a live gallery request.
export const numaSamples = [
  { id: "da2093932bc93096ef729dc9996a94c156e5b809b3336fd3a785a55ecc7d116a", thought: "a guitar solo" },
  { id: "db745336f63fd234fdaef14613fedd265c4482d5b2ec20d9f9152c0d1b2ccce9", thought: "first day of school" },
  { id: "8c0f9862ba098a26e2ca64b4ad485fe6994a8828dd16b34ed9f2a8a7d3a29453", thought: "When my grandfather died" },
  { id: "2c0eccf78e469fcce63c6ea45359d09152dabbec645db67ebd7c57bd4013243e", thought: "rainy day in a long time" },
  { id: "c36adaf041cbfe9b00943b0ccdf24e716956983fef9ef3fed659a187916c7d64", thought: "I miss him" },
  { id: "b5fdfcdc3904f238ef7d890b452d6b787e5a78b7b3bdd249f3f7750d6fb89d0a", thought: "It's summer and we are going to the beach" },
  { id: "48614b228af135ce002f872cb502332b8462473907d507eadf73dac003afbef0", thought: "the happiest moment, when she said yes" },
  { id: "8db3fe95160c453e906eaa46652f0676351e4ee476300e7c538b27cbce2e2cca", thought: "the day I met my cat" },
].map((sample) => ({ ...sample, audioUrl: `https://media.numa.channel/${sample.id}.mp3` }));
