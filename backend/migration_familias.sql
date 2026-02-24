-- 1. Crear la tabla de Familias de Metales si no existe.
-- Esta tabla almacenará los grupos de metales (ej: Aluminios, Cobres).
CREATE TABLE IF NOT EXISTS familias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Alterar la tabla de Metales para agregar la relación con Familias.
-- Se asume que la tabla 'metales' ya existe.

-- Primero, verificar y agregar la columna 'familia_id' si no existe.
ALTER TABLE metales ADD COLUMN IF NOT EXISTS familia_id INT;

-- Luego, eliminar la restricción de clave externa si ya existe, para evitar errores al volver a crearla.
ALTER TABLE metales DROP CONSTRAINT IF EXISTS fk_familia;

-- Crear la restricción de clave externa (foreign key) que vincula 'metales' con 'familias'.
-- ON DELETE SET NULL significa que si se borra una familia, el metal asociado quedará sin familia (null).
ALTER TABLE metales ADD CONSTRAINT fk_familia
    FOREIGN KEY (familia_id)
    REFERENCES familias(id)
    ON DELETE SET NULL;

-- Finalmente, asegurar que no haya metales con el mismo nombre dentro de la misma familia.
-- Se elimina primero la restricción por si existiera con otro nombre.
ALTER TABLE metales DROP CONSTRAINT IF EXISTS uq_familia_nombre;

-- Crear la restricción de unicidad.
ALTER TABLE metales ADD CONSTRAINT uq_familia_nombre
    UNIQUE (familia_id, nombre);

-- Mensaje para el usuario:
-- El script ha sido diseñado para ser seguro y no debería causar pérdida de datos.
-- Por favor, ejecute este script en su base de datos para resolver el error.
