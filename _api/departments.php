<?php 
require_once('initialize.php');

$method = $_SERVER['REQUEST_METHOD'];

switch($method){
	case 'GET': echo json_encode(SelectRecords('departments'));
	break;
	case 'POST': echo 'POST request';
	break;
	case 'PUT': echo 'put request';
	break;
	case 'DELETE': echo 'delete request';
	break;
}

?>