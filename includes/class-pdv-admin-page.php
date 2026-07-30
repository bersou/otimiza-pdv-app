<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PDV_Admin_Page {

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'add_menu_page' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
    }

    public function add_menu_page() {
        add_menu_page(
            __( 'PDV Caixa', 'pdv-mobile-br' ),
            __( 'PDV', 'pdv-mobile-br' ),
            'manage_woocommerce',
            'pdv-mobile-br',
            array( $this, 'render_page' ),
            'dashicons-store',
            56
        );
    }

    public function enqueue_scripts( $hook ) {
        if ( $hook !== 'toplevel_page_pdv-mobile-br' ) {
            return;
        }

        // Assets built by Vite
        $js_file = PDV_MOBILE_BR_PLUGIN_URL . 'assets/js/index.js';
        $css_file = PDV_MOBILE_BR_PLUGIN_URL . 'assets/css/index.css';

        wp_enqueue_script( 'pdv-mobile-br-app', $js_file, array('jquery'), PDV_MOBILE_BR_VERSION, true );
        wp_enqueue_style( 'pdv-mobile-br-style', $css_file, array(), PDV_MOBILE_BR_VERSION );
        
        wp_localize_script( 'pdv-mobile-br-app', 'pdvParams', array(
            'rest_url' => esc_url_raw( rest_url() ),
            'nonce'    => wp_create_nonce( 'wp_rest' ),
            'currency' => 'BRL'
        ) );
    }

    public function render_page() {
        echo '<div id="pdv-mobile-br-root"></div>';
    }
}
