<?php
/**
 * Plugin Name: PDV Mobile BR
 * Description: Ponto de Venda (PDV/POS) para WooCommerce focado em pequenos e médios comércios do Brasil.
 * Version: 1.0.0
 * Author: Antigravity Engineer
 * Text Domain: pdv-mobile-br
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

define( 'PDV_MOBILE_BR_VERSION', '1.0.0' );
define( 'PDV_MOBILE_BR_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'PDV_MOBILE_BR_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Include Core Classes
require_once PDV_MOBILE_BR_PLUGIN_DIR . 'includes/class-pdv-rest-api.php';
require_once PDV_MOBILE_BR_PLUGIN_DIR . 'includes/class-pdv-admin-page.php';
require_once PDV_MOBILE_BR_PLUGIN_DIR . 'includes/class-pdv-frontend.php';

// Initialize
add_action( 'plugins_loaded', 'pdv_mobile_br_init' );
function pdv_mobile_br_init() {
    if ( class_exists( 'WooCommerce' ) ) {
        new PDV_Rest_API();
        new PDV_Admin_Page();
        new PDV_Frontend();
    } else {
        add_action( 'admin_notices', 'pdv_mobile_br_wc_missing_notice' );
    }
}

function pdv_mobile_br_wc_missing_notice() {
    echo '<div class="error"><p>' . esc_html__( 'PDV Mobile BR requer o WooCommerce ativo para funcionar.', 'pdv-mobile-br' ) . '</p></div>';
}
