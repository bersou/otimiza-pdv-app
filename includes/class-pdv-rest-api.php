<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class PDV_Rest_API {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'pdv/v1', '/products', array(
            'methods'  => 'GET',
            'callback' => array( $this, 'get_products' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
        
        register_rest_route( 'pdv/v1', '/checkout', array(
            'methods'  => 'POST',
            'callback' => array( $this, 'process_checkout' ),
            'permission_callback' => array( $this, 'check_permission' )
        ) );
    }

    public function check_permission() {
        return current_user_can( 'manage_woocommerce' );
    }

    public function get_products( $request ) {
        $args = array(
            'status' => 'publish',
            'limit'  => -1,
        );
        $products = wc_get_products( $args );
        $data = array();
        
        foreach ( $products as $product ) {
            $data[] = array(
                'id'    => $product->get_id(),
                'name'  => $product->get_name(),
                'price' => $product->get_price(),
                'sku'   => $product->get_sku(),
                'image' => wp_get_attachment_image_url( $product->get_image_id(), 'thumbnail' ),
                'stock' => $product->get_stock_quantity()
            );
        }
        
        return rest_ensure_response( $data );
    }
    
    public function process_checkout( $request ) {
        // Logica para criar pedido WooCommerce a partir do PDV
        return rest_ensure_response( array( 'success' => true, 'message' => 'Pedido processado com sucesso' ) );
    }
}
