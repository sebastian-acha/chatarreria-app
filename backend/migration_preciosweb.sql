-- Migración: tabla de precios para la web
-- Almacena familias, materiales y precios que se exponen públicamente en /api/preciosweb
CREATE TABLE IF NOT EXISTS preciosweb (
    id SERIAL PRIMARY KEY,
    familia VARCHAR(100) NOT NULL,
    material VARCHAR(100) NOT NULL,
    precio DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (familia, material)
);
