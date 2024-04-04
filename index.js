const express = require("express");
const morgan = require("morgan");
const PORT = process.env.PORT || 3001;
const app = express();
const cors = require("cors");

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

const persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const dataId = () => {
  return Math.floor(Math.random() * 1000);
};

app.get("/", (_req, res) => {
  res.send("hello world");
});

app.get("/api/persons", (_req, res) => {
  if (!persons) {
    return res.status(404).send("no data available");
  }
  res.json(persons);
});

app.post("/api/persons", (req, res) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "name or number is missing",
    });
  }

  const isNameExist = persons.find(
    (person) => person.name.toLowerCase() === name.toLowerCase()
  );

  if (isNameExist) {
    return res.status(409).json({
      error: "name must be unique",
    });
  }

  const newPerson = {
    id: dataId(),
    name: name,
    number: number,
  };

  personsList = persons.concat(newPerson);

  res.json(newPerson);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find((person) => person.id === id);
  if (!person) {
    return res.status(404).send("person not found");
  }
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  persons.filter((person) => person.id !== id);
  res.status(204).send;
});

app.get("/info", (_req, res) => {
  res.send(`
        <p>Phonebook has info for ${data.length} people</p>
        <br/>
        <p>${new Date()}</p>
    `);
});

app.listen(PORT, () => {
  console.log(`app is running @ port ${PORT}`);
});
