const axios = require('axios');
const knex = require('knex')(require('../knexfile').development);
const { UNIVERCITIES_API_URL } = require('../utils/costants');

const initUniversities = async () => {
  try {
    const existingUniversities = await knex.raw('SELECT * FROM universities');
    console.log(UNIVERCITIES_API_URL);
    if (existingUniversities.rows.length === 0) {
      const response = await axios.get(UNIVERCITIES_API_URL);
      console.log(response);
      const universities = response.data.map((university) => ({
        name: university.name,
      }));

      universities.sort((a, b) => a.name.localeCompare(b.name));
      universities.forEach(async (univercity) => {
        await knex.raw('INSERT INTO universities (name) VALUES (:name) RETURNING *', univercity);
      });
    }
  } catch (error) {
    console.error('Failed to initialize universities:', error);
  }
};

const getUniversities = async (req, res) => {
  try {
    const universities = await knex.raw('SELECT * FROM universities');
    res.json(universities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch university data.' });
  }
};

const addUniversity = async (req, res) => {
  try {
    const { name, country } = req.body;
    if (!name || !country) {
      return res.status(400).json({ error: 'Name and country are required.' });
    }

    const university = { name, country };
    const insertedUniversity = await knex.raw('INSERT INTO universities (name, country) VALUES (:name, :country) RETURNING *', university);

    return res.json(insertedUniversity[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add university.' });
  }
};

const getUniversityById = async (req, res) => {
  try {
    const { id } = req.params;
    const university = await knex.raw('SELECT * FROM universities WHERE id = ?', [id]);
    if (!university) {
      return res.status(404).json({ error: 'University not found.' });
    }

    return res.json(university);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch university.' });
  }
};

const deleteUniversity = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUniversity = await knex.raw('DELETE FROM universities WHERE id = ?', [id]);

    if (!deletedUniversity) {
      return res.status(404).json({ error: 'University not found.' });
    }

    return res.json({ message: 'University deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete university.' });
  }
};

const deleteAllUniversities = async (req, res) => {
  try {
    await knex.raw('DELETE FROM universities');
    return res.json({ message: 'All universities deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete all universities.' });
  }
};

module.exports = {
  initUniversities,
  deleteAllUniversities,
  deleteUniversity,
  getUniversityById,
  getUniversities,
  addUniversity,
};
