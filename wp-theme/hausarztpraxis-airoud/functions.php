<?php
function haa_theme_setup() {
    add_theme_support('title-tag');
}
add_action('after_setup_theme', 'haa_theme_setup');

function haa_enqueue_assets() {
    $main_css_path = get_template_directory() . '/assets/css/main.css';
    $main_css_ver  = file_exists($main_css_path) ? filemtime($main_css_path) : '1.0.0';

    // Base theme stylesheet (keeps theme header) – keep minimal or empty if styling only in main.css
    wp_enqueue_style('haa-theme-style', get_stylesheet_uri(), [], '1.0.0');
    // Migrated main stylesheet
    wp_enqueue_style('haa-main', get_template_directory_uri() . '/assets/css/main.css', ['haa-theme-style'], $main_css_ver);
    // External fonts & icons (later can be self-hosted)
    wp_enqueue_style('haa-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', [], null);
    wp_enqueue_style('haa-fa', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', [], '6.4.0');

    $main_js_path = get_template_directory() . '/assets/js/main.js';
    $main_js_ver  = file_exists($main_js_path) ? filemtime($main_js_path) : '1.0.0';
    wp_enqueue_script('haa-main', get_template_directory_uri() . '/assets/js/main.js', [], $main_js_ver, true);
}
add_action('wp_enqueue_scripts', 'haa_enqueue_assets');

// Cleanup head
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'wp_shortlink_wp_head');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'rsd_link');

function haa_disable_emojis() {
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('admin_print_scripts', 'print_emoji_detection_script');
    remove_action('wp_print_styles', 'print_emoji_styles');
    remove_action('admin_print_styles', 'print_emoji_styles');
}
add_action('init', 'haa_disable_emojis');
