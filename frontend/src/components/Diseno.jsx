import React, { useState, useEffect } from 'react';
import { useDiseno } from '../context/DisenoContext';

const Diseno = () => {
    const { customCss, saveCustomCss, loading } = useDiseno();
    const [css, setCss] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!loading) {
            setCss(customCss);
        }
    }, [customCss, loading]);

    const handleSave = async () => {
        setIsSaving(true);
        setMessage('');
        try {
            await saveCustomCss(css);
            setMessage('Estilos guardados correctamente.');
        } catch (error) {
            setMessage('Error al guardar los estilos.');
        } finally {
            setIsSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>Personalización de Diseño</h2>
            <p>Añada o edite los estilos CSS para la aplicación. Estos estilos se aplicarán globalmente.</p>
            
            <textarea
                value={css}
                onChange={(e) => setCss(e.target.value)}
                placeholder="/* Escriba su CSS aquí */"
                rows="20"
                style={{ width: '100%', fontFamily: 'monospace', fontSize: '14px', border: '1px solid #ccc', padding: '10px' }}
                disabled={loading}
            />

            <button onClick={handleSave} disabled={isSaving || loading} style={{ marginTop: '10px' }}>
                {isSaving ? 'Guardando...' : 'Guardar Estilos'}
            </button>

            {message && <p style={{ marginTop: '10px' }}>{message}</p>}
        </div>
    );
};

export default Diseno;
