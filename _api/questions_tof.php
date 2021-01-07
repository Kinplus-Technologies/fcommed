<?php 
require_once('initialize.php');

$method = $_SERVER['REQUEST_METHOD'];
$table = 'questns_tof';
$res = '';

switch($method){
	case 'GET':
		$u = $_GET['_u'] ;
		if($u==1){
			echo json_encode(selectQuestions($table, '*', "active=1"));
		} else if($u==2){
			// echo json_encode(SelectRecords('questions_tof', '*', " 1 LIMIT 2"));
			echo json_encode(selectQuestions($table, '*', "1 ORDER BY created_on DESC"));
		}
		break;
	case 'POST': 
		$data = json_decode(file_get_contents("php://input")); // Get raw posted data
		echo postQuestions($data, $table);
		break;	
	case 'PUT': 
		$data = json_decode(file_get_contents("php://input")); // Get raw posted data
		echo updateQuestions($data, $table);
		break;	
	case 'DELETE':		
		$id = $_SERVER['QUERY_STRING'];
		$res = deleteRecord($table, "qid='{$id}'") ;
		echo $res ? json_encode(selectQuestions($table, '*', "1 ORDER BY created_on DESC")) : '';
		break;
	default:
		break;
}

?>