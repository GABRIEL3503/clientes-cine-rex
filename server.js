const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar la base de datos
const db = new sqlite3.Database('users.db', (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
        db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, phone TEXT, dni TEXT, status TEXT)", (err) => {
            if (err) {
                console.error('Error al crear la tabla', err.message);
            } else {
                console.log('Tabla users creada o ya existe');
            }
        });
    }
});

// Configurar el servidor
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar el registro de usuarios
app.post('https://clientes-cine-rex.onrender.com/register', (req, res) => {
    const { name, phone, dni } = req.body;
    const status = 'pendiente';

    const stmt = db.prepare("INSERT INTO users (name, phone, dni, status) VALUES (?, ?, ?, ?)");
    stmt.run(name, phone, dni, status, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Usuario registrado correctamente', id: this.lastID });
    });
    stmt.finalize();
});

// Ruta para obtener los datos de los usuarios
app.get('https://clientes-cine-rex.onrender.com/users', (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Ruta para mostrar los datos de los usuarios
app.get('https://clientes-cine-rex.onrender.com/datos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'datos.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
// Ruta para actualizar el estado del usuario
app.post('/update-status', (req, res) => {
    const { id, status } = req.body;

    const stmt = db.prepare("UPDATE users SET status = ? WHERE id = ?");
    stmt.run(status, id, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Estado actualizado correctamente' });
    });
    stmt.finalize();
});
