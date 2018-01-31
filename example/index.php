<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
date_default_timezone_set('UTC');
$action = isset($_GET['action']) ? $_GET['action'] : 'home';
if (!isset($_POST['src'])||$_POST['src']!='noreload') {
    echo '<script src="js/noreload.js"></script><link rel="stylesheet" href="css/noreload.css">';
    echo '<div class="noreload_container">';
}
require_once 'views/private/nav.php';

if(file_exists('views/'. $action . '.php')){
    include_once 'views/'. $action . '.php';
} else {
    include_once 'views/private/404.php';
}
if (!isset($_POST['src'])||$_POST['src']!='noreload') {
echo '</div>';
}