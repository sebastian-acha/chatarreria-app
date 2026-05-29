-- Migración: agregar campos para compra tipo 'romana'
ALTER TABLE transacciones
ADD COLUMN IF NOT EXISTS tipo_compra VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (tipo_compra IN ('normal', 'romana'));

ALTER TABLE transacciones
ADD COLUMN IF NOT EXISTS peso_entrada DECIMAL(12,3);

ALTER TABLE transacciones
ADD COLUMN IF NOT EXISTS peso_salida DECIMAL(12,3);
