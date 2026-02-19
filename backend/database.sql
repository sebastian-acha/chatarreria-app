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
    sucursal_id INT REFERENCES sucursales (id),
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
    valor_por_kilo DECIMAL(10, 2) NOT NULL,
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
    transaccion_id INT NOT NULL REFERENCES transacciones (id) ON DELETE CASCADE,
    metal_id INT NOT NULL REFERENCES metales (id),
    peso_kilos DECIMAL(10, 3) NOT NULL,
    valor_kilo_aplicado DECIMAL(10, 2) NOT NULL,
    valor_kilo_oficial DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL
);

-- 6. Tabla de Configuración de la Empresa (Singleton)
CREATE TABLE IF NOT EXISTS configuracion (
    id INT PRIMARY KEY DEFAULT 1,
    nombre_empresa VARCHAR(255) NOT NULL DEFAULT 'Chatarrería',
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(100),
    logo_url TEXT,
    CHECK (id = 1) -- Asegura que solo haya una fila
);

-- DATOS DE PRUEBA (SEED)

-- Insertar configuración inicial (si no existe)
INSERT INTO
    configuracion (id, nombre_empresa)
VALUES (1, 'Mi Chatarrería')
ON CONFLICT (id) DO NOTHING;