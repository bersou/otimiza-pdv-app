<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PDV_Frontend {

    public function __construct() {
        add_action( 'template_redirect', array( $this, 'render_pdv_page' ) );
    }

    public function render_pdv_page() {
        // Verifica se a URL atual é /pdv
        $request_uri = $_SERVER['REQUEST_URI'];
        $path = parse_url($request_uri, PHP_URL_PATH);
        $home_path = parse_url(home_url(), PHP_URL_PATH);
        
        $home_path = rtrim($home_path, '/') . '/';
        $relative_path = substr($path, strlen($home_path));
        $relative_path = trim($relative_path, '/');

        if ( $relative_path === 'pdv' ) {
            $this->output_html();
            exit;
        }
    }

    private function output_html() {
        ?>
        <!DOCTYPE html>
        <html <?php language_attributes(); ?>>
        <head>
            <meta charset="<?php bloginfo( 'charset' ); ?>">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Acesso ao PDV</title>
            <?php 
            if ( ! is_user_logged_in() ) {
                wp_head(); // Carrega scripts base do WP
                ?>
                <style>
                    body {
                        background: #f0f2f5;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
                    }
                    .pdv-login-container {
                        background: #fff;
                        padding: 2.5rem 2rem;
                        border-radius: 8px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                        width: 100%;
                        max-width: 360px;
                        border: 1px solid #e2e8f0;
                    }
                    .pdv-login-container h1 {
                        text-align: center;
                        margin: 0 0 1.5rem 0;
                        font-size: 1.25rem;
                        color: #1e293b;
                        font-weight: 600;
                    }
                    .pdv-login-container .login-username,
                    .pdv-login-container .login-password {
                        margin-bottom: 1rem;
                    }
                    .pdv-login-container label {
                        display: block;
                        margin-bottom: 0.5rem;
                        color: #475569;
                        font-size: 0.875rem;
                        font-weight: 500;
                    }
                    .pdv-login-container input[type="text"],
                    .pdv-login-container input[type="password"] {
                        width: 100%;
                        padding: 0.6rem 0.75rem;
                        border: 1px solid #cbd5e1;
                        border-radius: 4px;
                        font-size: 1rem;
                        box-sizing: border-box;
                    }
                    .pdv-login-container input[type="text"]:focus,
                    .pdv-login-container input[type="password"]:focus {
                        border-color: #2271b1;
                        outline: none;
                        box-shadow: 0 0 0 1px #2271b1;
                    }
                    .pdv-login-container .login-remember {
                        margin-bottom: 1.5rem;
                        font-size: 0.875rem;
                        color: #475569;
                        display: flex;
                        align-items: center;
                    }
                    .pdv-login-container .login-remember input {
                        margin-right: 0.5rem;
                    }
                    .pdv-login-container .login-submit {
                        margin: 0;
                    }
                    .pdv-login-container .login-submit input {
                        width: 100%;
                        padding: 0.75rem;
                        background: #2271b1;
                        color: #fff;
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 1rem;
                        font-weight: 600;
                        transition: background 0.2s;
                    }
                    .pdv-login-container .login-submit input:hover {
                        background: #135e96;
                    }
                </style>
                <?php
            } else {
                $js_url = PDV_MOBILE_BR_PLUGIN_URL . 'assets/js/index.js';
                $css_url = PDV_MOBILE_BR_PLUGIN_URL . 'assets/css/index.css';
                ?>
                <link rel="stylesheet" href="<?php echo esc_url($css_url); ?>?v=<?php echo PDV_MOBILE_BR_VERSION; ?>">
                <script>
                    window.pdvParams = {
                        rest_url: "<?php echo esc_url_raw( rest_url() ); ?>",
                        nonce: "<?php echo wp_create_nonce( 'wp_rest' ); ?>",
                        currency: "BRL"
                    };
                </script>
                <?php
            }
            ?>
        </head>
        <body class="<?php echo !is_user_logged_in() ? 'pdv-login-page' : 'pdv-app-page'; ?>">
            <?php if ( ! is_user_logged_in() ) : ?>
                <div class="pdv-login-container">
                    <h1>Acesso ao PDV</h1>
                    <?php 
                    $args = array(
                        'echo'           => true,
                        'redirect'       => home_url( '/pdv/' ), 
                        'form_id'        => 'loginform',
                        'label_username' => __( 'Usuário ou E-mail' ),
                        'label_password' => __( 'Senha' ),
                        'label_remember' => __( 'Lembrar-me' ),
                        'label_log_in'   => __( 'Entrar no PDV' ),
                        'id_username'    => 'user_login',
                        'id_password'    => 'user_pass',
                        'id_remember'    => 'rememberme',
                        'id_submit'      => 'wp-submit',
                        'remember'       => true,
                        'value_username' => '',
                        'value_remember' => false
                    );
                    wp_login_form( $args ); 
                    ?>
                </div>
                <?php wp_footer(); ?>
            <?php else : ?>
                <div id="pdv-mobile-br-root"></div>
                <script type="module" src="<?php echo esc_url($js_url); ?>?v=<?php echo PDV_MOBILE_BR_VERSION; ?>"></script>
            <?php endif; ?>
        </body>
        </html>
        <?php
    }
}
