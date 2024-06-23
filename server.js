const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = 'your_secret_key'; // Cambia esto por una clave secreta segura

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
app.use(bodyParser.json());

// Ruta para manejar el registro de usuarios
app.post('/register', (req, res) => {
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

// Ruta para manejar el login de usuarios
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Aquí deberías verificar el usuario y la contraseña con tu base de datos o cualquier otro método de autenticación
    // Este es un ejemplo simple y NO es seguro para producción.
    if (username === 'admin' && password === 'rex') {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: 'Credenciales inválidas' });
    }
});

// Middleware para verificar el token
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
        req.user = user;
        next();
    });
}

// Ruta para obtener los datos de los usuarios (protegida)
app.get('/users', authenticateToken, (req, res) => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Ruta para actualizar el estado del usuario (protegida)
app.post('/update-status', authenticateToken, (req, res) => {
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

// Ruta para mostrar los datos de los usuarios (protegida)
app.get('/datos', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'datos.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
