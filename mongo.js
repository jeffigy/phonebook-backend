const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Provide password argument");
  process.exit();
}

if (process.argv.length > 3 && process.argv.length < 5) {
  console.log("Provide password, name, and number argument");
  process.exit();
}

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://admin:${password}@cluster0.tz2gub0.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  console.log("phonebook:");
  Person.find({})
    .then((result) => {
      if (result.length === 0) {
        console.log("no data found");
        process.exit();
      }
      result.forEach((person) => {
        console.log(`${person.name} ${person.number}`);
      });
      mongoose.connection.close();
    })
    .catch((error) => {
      console.log(error);
      mongoose.connection.close();
    });
}

if (process.argv.length === 5) {
  const person = new Person({
    name: `${name}`,
    number: `${number}`,
  });

  person.save().then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`);
    mongoose.connection.close();
  });
}
