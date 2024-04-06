require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const PORT = process.env.PORT;
const app = express();
const cors = require("cors");
const Person = require("./models/Person");

morgan.token("req-body", (req, _res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
  return "";
});

app.use(express.static("dist"));
app.use(express.json());
app.use(cors());
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :req-body"
  )
);

app.get("/", (_req, res) => {
  res.send("hello world");
});

app.get("/api/persons", (_req, res) => {
  Person.find({}).then((person) => {
    res.json(person);
  });
});

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;

  const nameRegex = new RegExp("^" + name + "$", "i");
  if (!name || !number) {
    return res.status(400).json({
      error: "name or number is missing",
    });
  }

  Person.findOne({ name: { $regex: nameRegex } })
    .then((existingPerson) => {
      if (existingPerson) {
        return res.status(409).json({
          error: "name must be unique",
        });
      } else {
        const person = new Person({ name, number });
        return person.save();
      }
    })
    .then((savedData) => {
      res.json(savedData);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    });
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => {
      next(error);
    });
});

app.put("/api/persons", (req, res, next) => {
  const { name, number } = req.body;

  const nameRegex = new RegExp("^" + name + "$", "i");

  Person.findOne({ name: { $regex: nameRegex } })
    .then((result) => {
      if (!result) {
        res.status(404).send({ error: "no person existed" });
      } else {
        const person = {
          number: number,
        };
        Person.findByIdAndUpdate(result.id, person, { new: true })
          .then((updatedPerson) => {
            res.json(updatedPerson);
          })
          .catch((error) => next(error));
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  Person.findByIdAndDelete(id)
    .then((result) => {
      res
        .status(200)
        .send({ message: `Person ${result.name}Sucessfully deleted` });
    })
    .catch((error) => next(error));
});

app.get("/info", (_req, res) => {
  Person.find({}).then((persons) => {
    res.send(`
          <p>Phonebook has info for ${persons.length} people</p>
          <br/>
          <p>${new Date()}</p>
      `);
  });
});

const erroHandler = (error, _req, res, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }
  next(error);
};
app.use(erroHandler);

app.listen(PORT, () => {
  console.log(`app is running @ port ${PORT}`);
});
