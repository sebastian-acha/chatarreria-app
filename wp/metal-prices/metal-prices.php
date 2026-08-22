<?php
/**
 * Plugin Name: Precios de Metales - Chatarrería
 * Description: Un plugin para mostrar los precios de los metales desde una base de datos externa. Utiliza el shortcode [display_metal_prices].
 * Version: 1.3
 * Author: Gemini
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// --- LÓGICA DE CONEXIÓN AUXILIAR ---

/**
 * Establece una conexión PDO a la base de datos externa.
 * Reutiliza la lógica para evitar duplicar código.
 * @return PDO|string Una instancia de PDO si tiene éxito, o un string de error si falla.
 */
function ch_get_db_connection() {
    $options = get_option('ch_db_settings');
    if (empty($options['host']) || empty($options['port']) || empty($options['dbname']) || empty($options['user']) || empty($options['password'])) {
        return 'Error: El plugin no ha sido configurado. Por favor, ve a Ajustes > Precios de Metales.';
    }

    $dsn = sprintf(
        'pgsql:host=%s;port=%d;dbname=%s;user=%s;password=%s',
        $options['host'],
        $options['port'],
        $options['dbname'],
        $options['user'],
        $options['password']
    );

    try {
        $pdo = new PDO($dsn);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        error_log('Error de conexión a la BD externa: ' . $e->getMessage());
        return 'Error al conectar con la base de datos. Revisa las credenciales y que la BD sea accesible.';
    }
}


// --- SECCIÓN DE ADMINISTRACIÓN ---

add_action('admin_menu', 'ch_add_admin_menu');
function ch_add_admin_menu() {
    add_menu_page('Chatarrapp', 'Chatarrapp', 'manage_options', 'chatarrarapp-settings', 'ch_settings_page_html', 'dashicons-money-alt', 26);
}

add_action('admin_init', 'ch_settings_init');
function ch_settings_init() {
    register_setting('metal_prices_group', 'ch_db_settings', 'ch_sanitize_settings');
}

function ch_sanitize_settings($input) {
    $sanitized_input = [];
    $text_fields = ['host', 'port', 'dbname', 'user', 'password', 'data_source', 'json_url'];
    
    foreach ($text_fields as $field) {
        if (isset($input[$field])) {
            $sanitized_input[$field] = sanitize_text_field($input[$field]);
        }
    }

    // Sanitizar los checkboxes de metales activos para DB
    if (isset($input['active_metals']) && is_array($input['active_metals'])) {
        $sanitized_input['active_metals'] = array_map('intval', array_keys($input['active_metals']));
    } else {
        $sanitized_input['active_metals'] = [];
    }

    // Sanitizar los checkboxes de metales activos para JSON
    if (isset($input['active_metals_json']) && is_array($input['active_metals_json'])) {
        $sanitized_input['active_metals_json'] = array_map('sanitize_text_field', array_keys($input['active_metals_json']));
    } else {
        $sanitized_input['active_metals_json'] = [];
    }

    return $sanitized_input;
}

function ch_settings_page_html() {
    if (!current_user_can('manage_options')) return;

    $options = get_option('ch_db_settings');
    $data_source = $options['data_source'] ?? 'db';
    $json_url = $options['json_url'] ?? '';
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        
        <form action="options.php" method="post">
            <?php settings_fields('metal_prices_group'); ?>
            
            <h2>1. Origen de Datos</h2>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Seleccionar Origen</th>
                    <td>
                        <label>
                            <input type="radio" name="ch_db_settings[data_source]" value="db" <?php checked($data_source, 'db'); ?> />
                            Base de Datos (PostgreSQL)
                        </label>
                        <br>
                        <label>
                            <input type="radio" name="ch_db_settings[data_source]" value="json" <?php checked($data_source, 'json'); ?> />
                            Endpoint JSON
                        </label>
                    </td>
                </tr>
            </table>

            <div id="db-settings" style="<?php echo $data_source === 'db' ? '' : 'display:none;'; ?>">
                <h2>2. Credenciales de la Base de Datos (PostgreSQL)</h2>
                <p>Introduce los datos de conexión de tu base de datos PostgreSQL.</p>
                <table class="form-table">
                    <tr valign="top"><th scope="row">Host (Endpoint)</th><td><input type="text" name="ch_db_settings[host]" value="<?php echo esc_attr($options['host'] ?? ''); ?>" class="regular-text" /></td></tr>
                    <tr valign="top"><th scope="row">Puerto</th><td><input type="number" name="ch_db_settings[port]" value="<?php echo esc_attr($options['port'] ?? '5432'); ?>" class="regular-text" /></td></tr>
                    <tr valign="top"><th scope="row">Nombre de BD</th><td><input type="text" name="ch_db_settings[dbname]" value="<?php echo esc_attr($options['dbname'] ?? ''); ?>" class="regular-text" /></td></tr>
                    <tr valign="top"><th scope="row">Usuario</th><td><input type="text" name="ch_db_settings[user]" value="<?php echo esc_attr($options['user'] ?? ''); ?>" class="regular-text" /></td></tr>
                    <tr valign="top"><th scope="row">Contraseña</th><td><input type="password" name="ch_db_settings[password]" value="<?php echo esc_attr($options['password'] ?? ''); ?>" class="regular-text" /></td></tr>
                </table>
            </div>

            <div id="json-settings" style="<?php echo $data_source === 'json' ? '' : 'display:none;'; ?>">
                <h2>2. Configuración del Endpoint JSON</h2>
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row">URL del Endpoint JSON</th>
                        <td><input type="url" name="ch_db_settings[json_url]" value="<?php echo esc_attr($json_url); ?>" class="regular-text" placeholder="https://ejemplo.com/api/precios" /></td>
                    </tr>
                </table>
            </div>

            <hr>

            <h2>3. Metales a Mostrar por Defecto</h2>
            <div id="metals-list">
                <?php
                if ($data_source === 'db') {
                    $pdo = ch_get_db_connection();
                    if (is_string($pdo)) {
                        echo '<p style="color: red;">' . esc_html($pdo) . ' Por favor, guarda las credenciales correctas para ver el listado de metales.</p>';
                    } else {
                        echo '<p>Selecciona los metales que se mostrarán por defecto con <code>[display_metal_prices]</code>.</p>';
                        $stmt = $pdo->query('SELECT id, nombre FROM metales ORDER BY nombre ASC');
                        $all_metals = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        $active_metals = $options['active_metals'] ?? [];

                        if (empty($all_metals)) {
                            echo '<p>No se encontraron metales en la base de datos.</p>';
                        } else {
                            echo '<ul style="list-style: none;">';
                            foreach ($all_metals as $metal) {
                                $checked = in_array($metal['id'], $active_metals) ? 'checked' : '';
                                echo '<li><label>';
                                echo '<input type="checkbox" name="ch_db_settings[active_metals][' . esc_attr($metal['id']) . ']" value="1" ' . $checked . ' /> ';
                                echo esc_html($metal['nombre']);
                                echo '</label></li>';
                            }
                            echo '</ul>';
                        }
                    }
                } elseif ($data_source === 'json') {
                    if (empty($json_url)) {
                        echo '<p style="color: red;">Por favor, introduce una URL para el endpoint JSON y guarda los cambios.</p>';
                    } else {
                        $response = wp_remote_get($json_url);
                        if (is_wp_error($response)) {
                            echo '<p style="color: red;">Error al contactar la URL: ' . esc_html($response->get_error_message()) . '</p>';
                        } elseif (wp_remote_retrieve_response_code($response) !== 200) {
                             echo '<p style="color: red;">Error: La URL devolvió un código de estado ' . esc_html(wp_remote_retrieve_response_code($response)) . '</p>';
                        } else {
                            $body = wp_remote_retrieve_body($response);
                            $data = json_decode($body, true);

                            if (json_last_error() !== JSON_ERROR_NONE) {
                                echo '<p style="color: red;">Error: El JSON recibido no es válido.</p>';
                            } elseif (empty($data)) {
                                echo '<p>El endpoint JSON no devolvió datos o está vacío.</p>';
                            } else {
                                echo '<p>Selecciona los metales que se mostrarán por defecto con <code>[display_metal_prices]</code>.</p>';
                                $active_metals_json = $options['active_metals_json'] ?? [];
                                echo '<ul style="list-style: none;">';
                                foreach ($data as $family => $metals) {
                                    echo '<li><strong>' . esc_html($family) . '</strong><ul>';
                                    foreach($metals as $metal) {
                                        $metal_key = $family . '::' . $metal['nombre'];
                                        $checked = in_array($metal_key, $active_metals_json) ? 'checked' : '';
                                        echo '<li><label>';
                                        echo '<input type="checkbox" name="ch_db_settings[active_metals_json][' . esc_attr($metal_key) . ']" value="1" ' . $checked . ' /> ';
                                        echo esc_html($metal['nombre']);
                                        echo '</label></li>';
                                    }
                                    echo '</ul></li>';
                                }
                                echo '</ul>';
                            }
                        }
                    }
                }
                ?>
            </div>
            
            <?php submit_button('Guardar Todos los Cambios'); ?>
        </form>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const radios = document.querySelectorAll('input[name="ch_db_settings[data_source]"]');
            const dbSettings = document.getElementById('db-settings');
            const jsonSettings = document.getElementById('json-settings');

            function toggleSettings() {
                if (document.querySelector('input[name="ch_db_settings[data_source]"]:checked').value === 'json') {
                    dbSettings.style.display = 'none';
                    jsonSettings.style.display = '';
                } else {
                    dbSettings.style.display = '';
                    jsonSettings.style.display = 'none';
                }
            }

            radios.forEach(radio => radio.addEventListener('change', toggleSettings));
        });
    </script>
    <?php
}


// --- SECCIÓN DEL SHORTCODE (FRONT-END) ---

function get_metal_prices_from_db($ids = [], $format = 'list') {
    $options = get_option('ch_db_settings');

    if (empty($ids)) {
        $ids = $options['active_metals'] ?? [];
        if (empty($ids)) {
            return '<p>No hay metales activos configurados para mostrar.</p>';
        }
    }
    
    $pdo = ch_get_db_connection();
    if (is_string($pdo)) {
        return '<p>' . esc_html($pdo) . '</p>';
    }

    try {
        $placeholders = implode(',', array_fill(0, count($ids), '?'));
        $sql = "SELECT m.nombre, m.valor_por_kilo, f.nombre as familia 
                FROM metales m 
                LEFT JOIN familias f ON m.familia_id = f.id 
                WHERE m.id IN ($placeholders)
                ORDER BY f.nombre, m.nombre";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_map('intval', $ids));
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($results)) {
            return '<p>No se encontraron los metales seleccionados.</p>';
        }

        return ch_render_prices_html($results, $format);

    } catch (PDOException $e) {
        error_log('Error de consulta de metales: ' . $e->getMessage());
        return '<p>Error al consultar el servicio de precios. Intente más tarde.</p>';
    }
}

function get_metal_prices_from_json($ids = [], $format = 'list') {
    $options = get_option('ch_db_settings');
    $json_url = $options['json_url'] ?? '';

    if (empty($json_url)) {
        return '<p>El plugin no está configurado. Falta la URL del endpoint JSON.</p>';
    }
    
    // Si no se pasan IDs en el shortcode, usar los guardados en la configuración.
    if (empty($ids)) {
        $ids = $options['active_metals_json'] ?? [];
        if (empty($ids)) {
            return '<p>No hay metales activos configurados para mostrar.</p>';
        }
    }

    $response = wp_remote_get($json_url);

    if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
        error_log('Error al obtener JSON para shortcode: ' . (is_wp_error($response) ? $response->get_error_message() : 'Código HTTP ' . wp_remote_retrieve_response_code($response)));
        return '<p>Error al consultar el servicio de precios. Intente más tarde.</p>';
    }

    $data = json_decode(wp_remote_retrieve_body($response), true);

    if (json_last_error() !== JSON_ERROR_NONE || empty($data)) {
        return '<p>No se pudieron obtener los precios (JSON inválido o vacío).</p>';
    }

    $results = [];
    foreach ($data as $family => $metals) {
        foreach ($metals as $metal) {
            $metal_key = $family . '::' . $metal['nombre'];
            if (in_array($metal_key, $ids)) {
                $results[] = [
                    'familia' => $family,
                    'nombre' => $metal['nombre'],
                    'valor_por_kilo' => $metal['precio']
                ];
            }
        }
    }

    if (empty($results)) {
        return '<p>No se encontraron los metales seleccionados.</p>';
    }

    return ch_render_prices_html($results, $format);
}

function ch_render_prices_html($results, $format = 'list') {
    $grouped_by_family = [];
    foreach ($results as $row) {
        $family = $row['familia'] ?: 'Sin Familia';
        $grouped_by_family[$family][] = $row;
    }

    // Ordenar familias alfabéticamente
    ksort($grouped_by_family);

    // Ordenar materiales alfabéticamente dentro de cada familia
    foreach ($grouped_by_family as $family => $metals) {
        usort($metals, function ($a, $b) {
            return strcmp($a['nombre'], $b['nombre']);
        });
        $grouped_by_family[$family] = $metals;
    }

    if ($format === 'table') {
        return ch_render_prices_table($grouped_by_family);
    }

    return ch_render_prices_list($grouped_by_family);
}

function ch_render_prices_list($grouped_by_family) {
    $html = '<div class="ch-metals-list">';
    foreach ($grouped_by_family as $family => $metals) {
        $html .= '<div class="ch-family">';
        $html .= '<h3 class="ch-family-title">' . htmlspecialchars($family) . '</h3>';
        $html .= '<ul class="ch-metals">';
        foreach ($metals as $metal) {
            // Formatear el precio con separador de miles de puntos y coma para decimales
            $formatted_price = number_format($metal['valor_por_kilo'], 0, ',', '.');
            $html .= '<li class="ch-metal">';
            $html .= '<span class="ch-metal-name">' . htmlspecialchars($metal['nombre']) . '</span>';
            $html .= '<span class="ch-metal-price">$' . $formatted_price . '</span>';
            $html .= '</li>';
        }
        $html .= '</ul>';
        $html .= '</div>';
    }
    $html .= '</div>';

    return $html;
}

function ch_render_prices_table($grouped_by_family) {
    $html = '<table class="ch-metals-table">';
    $html .= '<thead class="ch-metals-table-head">';
    $html .= '<tr>';
    $html .= '<th class="ch-th ch-th-family">Familia</th>';
    $html .= '<th class="ch-th ch-th-material">Material</th>';
    $html .= '<th class="ch-th ch-th-price">Precio</th>';
    $html .= '</tr>';
    $html .= '</thead>';
    $html .= '<tbody>';
    foreach ($grouped_by_family as $family => $metals) {
        $html .= '<tr class="ch-family-header">';
        $html .= '<th colspan="3" class="ch-family-title">' . htmlspecialchars($family) . '</th>';
        $html .= '</tr>';
        foreach ($metals as $metal) {
            $formatted_price = number_format($metal['valor_por_kilo'], 0, ',', '.');
            $html .= '<tr class="ch-metal">';
            $html .= '<td class="ch-metal-family">' . htmlspecialchars($family) . '</td>';
            $html .= '<td class="ch-metal-name">' . htmlspecialchars($metal['nombre']) . '</td>';
            $html .= '<td class="ch-metal-price">$' . $formatted_price . '</td>';
            $html .= '</tr>';
        }
    }
    $html .= '</tbody>';
    $html .= '</table>';

    return $html;
}

function display_metal_prices_shortcode($atts) {
    $atts = array_change_key_case((array)$atts, CASE_LOWER);
    $options = get_option('ch_db_settings');
    $data_source = $options['data_source'] ?? 'db';

    // El atributo 'ids' del shortcode es una lista de identificadores separados por coma.
    $ids = [];
    if (isset($atts['ids'])) {
        $ids = array_map('trim', explode(',', $atts['ids']));
    }

    // El atributo 'format' permite elegir entre lista HTML y tabla (por defecto: lista).
    $format = 'list';
    if (isset($atts['format'])) {
        $format = strtolower(trim($atts['format']));
        if (in_array($format, ['tabla', 'table', 'tab'], true)) {
            $format = 'table';
        } else {
            $format = 'list';
        }
    }

    if ($data_source === 'json') {
        return get_metal_prices_from_json($ids, $format);
    }
    
    // Por defecto (y por retrocompatibilidad), usamos la base de datos.
    // La versión de BD espera IDs numéricos.
    if (!empty($ids)) {
        $ids = array_map('intval', $ids);
    }
    return get_metal_prices_from_db($ids, $format);
}
add_shortcode('display_metal_prices', 'display_metal_prices_shortcode');
