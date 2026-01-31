-- 1. Tabla de Sucursales
CREATE TABLE IF NOT EXISTS sucursales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Usuarios (Admin y Ejecutivos)
-- sucursal_id es NULL si es un Administrador General
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    sucursal_id INT REFERENCES sucursales(id),
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('ADMIN', 'EJECUTIVO')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Metales (Precios actuales)
CREATE TABLE IF NOT EXISTS metales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    valor_por_gramo DECIMAL(10, 2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Transacciones (Compras / Vouchers)
CREATE TABLE IF NOT EXISTS transacciones (
    id SERIAL PRIMARY KEY, -- Número correlativo del voucher
    sucursal_id INT REFERENCES sucursales(id),
    ejecutivo_id INT REFERENCES usuarios(id),
    
    -- Datos del Cliente
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_rut_dni VARCHAR(20),
    
    -- Datos Consolidados de la Compra
    total_pagar DECIMAL(12, 2) NOT NULL,
    
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Detalles de Transacción
CREATE TABLE IF NOT EXISTS transaccion_detalles (
    id SERIAL PRIMARY KEY,
    transaccion_id INT NOT NULL REFERENCES transacciones(id) ON DELETE CASCADE,
    metal_id INT NOT NULL REFERENCES metales(id),
    peso_gramos DECIMAL(10, 2) NOT NULL,
    valor_gramo_aplicado DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL
);


-- DATOS DE PRUEBA (SEED)

-- Insertar una sucursal inicial
INSERT INTO sucursales (nombre, direccion) 
VALUES ('Sucursal Central', 'Av. Principal 123, Ciudad')
ON CONFLICT DO NOTHING;

-- Insertar metales comunes
INSERT INTO metales (nombre, valor_por_gramo) VALUES 
('Cobre', 8.50),
('Aluminio', 1.20),
('Bronce', 6.00),
('Hierro', 0.80)
ON CONFLICT DO NOTHING;

-- NOTA: Para insertar el usuario Admin, necesitaremos generar el hash de la contraseña primero.
-- Lo haremos desde la aplicación o con un script auxiliar más adelante.