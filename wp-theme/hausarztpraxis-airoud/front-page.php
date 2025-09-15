<?php
/* Template Name: Front Page */
get_header();
?>
<section id="intro" class="intro-section">
  <div class="intro-background"></div>
  <div class="intro-content">
    <div class="intro-text">
      <h1>Willkommen in der Hausarztpraxis Airoud</h1>
      <p class="intro-subtitle">Ihre Gesundheit liegt uns am Herzen</p>
      <div class="intro-features">
        <div class="feature"><i class="fas fa-clock"></i><span>Flexible Sprechzeiten</span></div>
        <div class="feature"><i class="fas fa-user-md"></i><span>Erfahrenes Team</span></div>
        <div class="feature"><i class="fas fa-heart"></i><span>Persönliche Betreuung</span></div>
      </div>
      <p class="intro-description">Wir stehen Ihnen als kompetenter Partner für Ihre Gesundheit zur Seite. In unserer modernen Praxis verbinden wir medizinische Expertise mit persönlicher Betreuung und neuesten Behandlungsmethoden.</p>
      <button class="cta-button" onclick="scrollToSection('contact')">Termin vereinbaren</button>
    </div>
    <div class="doctor-image-container">
      <img src="<?php echo get_template_directory_uri(); ?>/images/Portrait_Export_v02.jpg" alt="Portrait Abdullah Airoud" class="doctor-image" id="doctor-image" />
      <div class="image-overlay"></div>
    </div>
  </div>
</section>
<section id="services" class="services-section">
  <div class="container">
    <h2>Unsere Leistungen</h2>
    <p class="section-subtitle">Umfassende medizinische Versorgung für die ganze Familie</p>
    <div class="services-grid"></div>
  </div>
</section>
<section id="about" class="about-section">
  <div class="container">
    <h2>Über uns</h2>
    <div class="about-content">
      <div class="about-text">
        <h3>Abdullah Airoud</h3>
        <p class="qualification">Facharzt für Innere Medizin-<br>Notfallmedizin</p>
        <p>Herzlich willkommen in unserer Hausarztpraxis! Mit Kompetenz und Mitgefühl stehen wir unseren Patienten zur Seite. Ihre Gesundheit ist unsere Priorität.</p>
        <div class="qualifications">
          <h4>Sprachkenntnisse:</h4>
          <p>Wir sprechen deutsch, englisch, arabisch und italienisch.</p>
        </div>
        <div class="team-info">
          <h4>Unser Team</h4>
          <p>Unser engagiertes Team sorgt dafür, dass Sie sich in unserer Praxis wohlfühlen und optimal betreut werden. Wir nehmen uns Zeit für Ihre Anliegen und behandeln jeden Patienten individuell.</p>
        </div>
      </div>
      <div class="team-image-container">
        <img src="<?php echo get_template_directory_uri(); ?>/images/team02.jpg" alt="Praxisteam Hausarztpraxis Airoud" class="team-image" />
      </div>
    </div>
  </div>
</section>
<section id="contact" class="contact-section">
  <div class="container">
    <h2>Kontakt</h2>
    <p class="section-subtitle">Wir sind für Sie da - kontaktieren Sie uns</p>
    <div class="contact-content">
      <div class="contact-info">
        <div class="info-card">
          <div class="info-section">
            <h3>Kontaktdaten</h3>
            <div class="info-item"><i class="fas fa-map-marker-alt"></i><div><strong>Adresse</strong><p>Adresse</p></div></div>
            <div class="info-item"><i class="fas fa-phone"></i><div><strong>Telefon</strong><p><a href="tel:+49020225350880">0202 25 350 880</a></p></div></div>
            <div class="info-item"><i class="fas fa-envelope"></i><div><strong>E-Mail</strong><p><a href="mailto:E-Mail">E-Mail</a></p></div></div>
          </div>
          <div class="info-section">
            <h3>Sprechzeiten</h3>
            <div class="opening-hours">
              <div class="hours-item"><span>Mo | Di:</span><span>08:30 - 13:00 | 16:00 - 18:00 Uhr</span></div>
              <div class="hours-item"><span>Mi:</span><span>08:30 - 13:00 Uhr</span></div>
              <div class="hours-item"><span>Do:</span><span>08:30 - 13:00 | 16:00 - 18:00 Uhr</span></div>
              <div class="hours-item"><span>Fr:</span><span>08:30 - 13:00 Uhr</span></div>
              <div class="hours-item"><span>Termine:</span><span>nach Vereinbarung</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- Service Modals -->
<?php
$modals = [
  'vorsorge' => ['title' => 'Vorsorgeuntersuchungen', 'body' => '<p>Vorbeugung ist der beste Schutz vor Krankheiten. Unsere umfassenden Vorsorgeuntersuchungen helfen dabei, Gesundheitsrisiken frühzeitig zu erkennen.</p><h4>Unser Vorsorgeprogramm:</h4><ul><li>Check-ups Untersuchungen</li><li>Hautkrebsscreening</li><li>Impfberatung und Impfungen</li><li>Krebsvorsorge beim Mann mit Prostatauntersuchung</li><li>Beratung zur Darmkrebs-Früherkennung</li></ul>'],
  'labor' => ['title' => 'Blutuntersuchungen und Labordiagnostik', 'body' => '<p>Moderne Labordiagnostik direkt in unserer Praxis ermöglicht schnelle und präzise Ergebnisse für eine optimale Behandlung und Diagnosestellung.</p><h4>Unsere Laborleistungen:</h4><ul><li>Großes und kleines Blutbild</li><li>Blutzucker- und HbA1c-Bestimmung</li><li>Cholesterin- und Fettstoffwechselanalyse</li><li>Leber- und Nierenwerte</li><li>Entzündungsparameter (CRP, BSG)</li><li>Schilddrüsenwerte</li><li>Vitaminbestimmung</li></ul>'],
  'ekg' => ['title' => 'EKG (Elektrokardiogramm)', 'body' => '<p>Das Elektrokardiogramm ist eine wichtige Untersuchung zur Beurteilung der Herzfunktion und des Herzrhythmus.</p><h4>Anwendung bei:</h4><ul><li>Verdacht auf Herzrhythmusstörungen</li><li>Brustschmerzen oder Herzstechen</li><li>Vorsorgeuntersuchungen</li><li>Kontrolle bei bekannten Herzerkrankungen</li><li>Medikamentenkontrolle</li><li>Präoperative Diagnostik</li></ul><p>Die Untersuchung ist schmerzfrei und dauert nur wenige Minuten.</p>'],
  'langzeit-ekg' => ['title' => 'Langzeit-EKG', 'body' => '<p>Das Langzeit-EKG zeichnet über 24 Stunden kontinuierlich den Herzrhythmus auf und ermöglicht die Diagnose von Herzrhythmusstörungen, die nur gelegentlich auftreten.</p><h4>Indikationen:</h4><ul><li>Herzstolpern oder Herzrasen</li><li>Schwindelanfälle ungeklärter Ursache</li><li>Verdacht auf nächtliche Herzrhythmusstörungen</li><li>Kontrolle nach Herzschrittmacher-Implantation</li><li>Überwachung bei Medikamenteneinstellung</li></ul><p>Sie erhalten ein kleines Aufzeichnungsgerät, das Sie 24 Stunden tragen.</p>'],
  'belastungs-ekg' => ['title' => 'Belastungs-EKG', 'body' => '<p>Das Belastungs-EKG untersucht die Herzfunktion unter körperlicher Anstrengung und kann Durchblutungsstörungen des Herzens aufdecken.</p><h4>Durchführung:</h4><ul><li>Stufenweise Belastung auf dem Ergometer</li><li>Kontinuierliche EKG-Aufzeichnung</li><li>Blutdruckmessung während der Belastung</li><li>Überwachung von Herzfrequenz und Rhythmus</li></ul><h4>Anwendung bei:</h4><ul><li>Verdacht auf koronare Herzkrankheit</li><li>Belastungsabhängigen Beschwerden</li><li>Sportmedizinischen Untersuchungen</li></ul>'],
  'blutdruck' => ['title' => 'Langzeit-Blutdruckmessung', 'body' => '<p>Die 24-Stunden-Blutdruckmessung gibt einen detaillierten Überblick über den Blutdruckverlauf im Alltag und ist wichtig für die Diagnose und Therapie von Bluthochdruck.</p><h4>Vorteile:</h4><ul><li>Erkennung von nächtlichem Bluthochdruck</li><li>Aufdeckung von Weißkittelhypertonie</li><li>Kontrolle der Medikamentenwirkung</li><li>Beurteilung des Blutdruckprofils über 24 Stunden</li></ul><h4>Durchführung:</h4><ul><li>Automatische Messungen alle 15-30 Minuten</li><li>Normaler Tagesablauf möglich</li><li>Führung eines Aktivitätsprotokolls</li></ul>'],
  'lungenfunktion' => ['title' => 'Lungenfunktionstest', 'body' => '<p>Der Lungenfunktionstest (Spirometrie) misst die Atemkapazität und gibt Aufschluss über die Funktion der Lunge und der Atemwege.</p><h4>Untersuchung bei:</h4><ul><li>Chronischem Husten</li><li>Atemnot bei Belastung</li><li>Verdacht auf Asthma</li><li>COPD (chronische Bronchitis)</li><li>Allergischen Atemwegserkrankungen</li><li>Arbeitsmedizinischen Vorsorgeuntersuchungen</li></ul><h4>Gemessen wird:</h4><ul><li>Lungenvolumen</li><li>Atemstromstärke</li><li>Atemwegsverengung</li></ul>'],
  'ultraschall' => ['title' => 'Ultraschalldiagnostik', 'body' => '<p>Die Ultraschalluntersuchung ist ein schonendes, schmerzfreies bildgebendes Verfahren, das ohne Röntgenstrahlung auskommt.</p><h4>Untersuchung von:</h4><ul><li>Bauchorgane (Leber, Gallenblase, Nieren, Milz)</li><li>Schilddrüse</li><li>Herz (Echokardiographie)</li><li>Blutgefäße (Doppler-Sonographie)</li><li>Weichteile und Gelenke</li></ul><h4>Vorteile:</h4><ul><li>Keine Strahlenbelastung</li><li>Schmerzfrei und nebenwirkungsfrei</li><li>Sofortige Ergebnisse</li><li>Wiederholbare Untersuchung</li></ul>'],
  'dmp' => ['title' => 'Disease-Management-Programme (DMP)', 'body' => '<p>Strukturierte Behandlungsprogramme für chronische Erkrankungen bieten eine optimale, langfristige Betreuung und Therapie.</p><h4>DMP-Programme für:</h4><ul><li>Diabetes mellitus Typ 1 und Typ 2</li><li>Koronare Herzkrankheit (KHK)</li><li>Asthma bronchiale</li><li>Chronisch obstruktive Lungenerkrankung (COPD)</li><li>Brustkrebs</li><li>Darmkrebs</li></ul><h4>Vorteile:</h4><ul><li>Regelmäßige Kontrolluntersuchungen</li><li>Strukturierte Therapieplanung</li><li>Patientenschulungen</li><li>Koordinierte Behandlung</li><li>Bessere Langzeitergebnisse</li></ul>'],
  'hausbesuche' => ['title' => 'Hausbesuche', 'body' => '<p>Wenn Sie nicht zu uns kommen können, kommen wir zu Ihnen. Unsere Hausbesuche ermöglichen eine medizinische Versorgung in der gewohnten Umgebung.</p><h4>Hausbesuche bieten wir an bei:</h4><ul><li>Akuten Erkrankungen, wenn Sie bettlägerig sind</li><li>Chronischen Erkrankungen mit eingeschränkter Mobilität</li><li>Palliativmedizinischer Betreuung</li><li>Nachsorge nach Krankenhausaufenthalten</li><li>Medizinischen Notfällen im häuslichen Bereich</li></ul><h4>Leistungen bei Hausbesuchen:</h4><ul><li>Allgemeine Untersuchung</li><li>Blutentnahme</li><li>Injektionen und Infusionen</li><li>Wundversorgung</li><li>Beratung von Angehörigen</li></ul><p><strong>Bitte vereinbaren Sie Hausbesuche rechtzeitig telefonisch mit uns.</strong></p>'],
  'hautkrebsscreening' => ['title' => 'Hautkrebsscreening', 'body' => '<p>Das Hautkrebsscreening dient der Früherkennung von bösartigen oder auffälligen Hautveränderungen. Je früher Hautkrebs erkannt wird, desto besser sind die Behandlungschancen.</p><h4>Untersuchungsinhalt:</h4><ul><li>Ganzkörperinspektion der Haut</li><li>Beurteilung von Muttermalen (ABCDE-Regel)</li><li>Erkennung von Basalzell- und Plattenepithelkarzinomen</li><li>Hinweise bei verdächtigen Läsionen</li></ul><h4>Empfohlen für:</h4><ul><li>Alle gesetzlich Versicherten ab 35 Jahren (alle 2 Jahre)</li><li>Menschen mit vielen Muttermalen</li><li>Heller Hauttyp oder hohe UV-Belastung</li></ul><p>Gern beraten wir Sie zu individuellen Risikofaktoren und weiterführenden Maßnahmen.</p>'],
  'psychosomatik' => ['title' => 'Psychosomatische Grundversorgung', 'body' => '<p>Die psychosomatische Grundversorgung betrachtet körperliche Beschwerden im Zusammenhang mit seelischen Belastungen. Ziel ist eine ganzheitliche Einschätzung und frühzeitige Unterstützung.</p><h4>Typische Beschwerdebilder:</h4><ul><li>Stressbedingte körperliche Symptome</li><li>Schlafstörungen und Erschöpfung</li><li>Unklare Bauch-, Kopf- oder Muskelschmerzen</li><li>Anspannung, innere Unruhe, Stimmungsschwankungen</li></ul><h4>Unser Vorgehen:</h4><ul><li>Ärztliches Gespräch und Anamnese</li><li>Basisdiagnostik zum Ausschluss organischer Ursachen</li><li>Einordnung psychosomatischer Einflussfaktoren</li><li>Beratung zu Entlastung, Schlaf, Bewegung</li><li>ggf. Überweisung zu Psychotherapie / Spezialisten</li></ul><p>Frühe Ansprache kann chronische Verläufe verhindern und die Lebensqualität verbessern.</p>']
];
foreach ($modals as $slug => $data) : ?>
<div id="modal-<?php echo esc_attr($slug); ?>" class="modal"><div class="modal-content"><span class="close">&times;</span><h3><?php echo $data['title']; ?></h3><div class="modal-body"><?php echo $data['body']; ?></div></div></div>
<?php endforeach; ?>
<?php get_footer(); ?>
