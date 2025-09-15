<!DOCTYPE html>
<html <?php language_attributes(); ?> >
<head>
<meta charset="<?php bloginfo('charset'); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?> >
<nav class="navbar" id="navbar">
  <div class="nav-container">
    <div class="hamburger-menu" id="hamburger-menu">
      <span></span><span></span><span></span>
    </div>
    <div class="logo">
      <i class="fas fa-user-md"></i>
      <span>Hausarztpraxis Airoud</span>
    </div>
    <div class="nav-actions">
      <button class="contact-btn" onclick="scrollToSection('contact')">
        <i class="fas fa-phone"></i><span>Kontakt</span>
      </button>
    </div>
  </div>
  <div class="mobile-menu" id="mobile-menu">
    <a href="#intro" onclick="scrollToSection('intro')">Startseite</a>
    <a href="#services" onclick="scrollToSection('services')">Leistungen</a>
    <a href="#about" onclick="scrollToSection('about')">Über uns</a>
    <a href="#contact" onclick="scrollToSection('contact')">Kontakt</a>
    <a href="<?php echo esc_url( home_url('/impressum/') ); ?>">Impressum</a>
    <a href="<?php echo esc_url( home_url('/datenschutz/') ); ?>">Datenschutz</a>
  </div>
</nav>
<main>
