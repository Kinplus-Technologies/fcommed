<?php 
require_once('initialize.php');

$method = $_SERVER['REQUEST_METHOD'];
$table = 'answers_bop';

switch($method){
	case 'GET':
		$u = $_GET['_u'] ;
		@$user_id = $_GET['_u_id'] ;
		if($u==1){ // user logged in
			echo json_encode(selectAnswers($table, '*', "user_id='{$user_id}'"));
		} else if($u==2){ // admin logged in, it return all
			echo json_encode(selectAnswers($table));
		}
		break;
	case 'POST': 
		$data = json_decode(file_get_contents("php://input")); // Get raw posted data
		echo postAnswers($data, $table); // create answers;
		break;
	case 'PUT':
		$data = json_decode(file_get_contents("php://input")); // Get raw posted data		
		echo updateAnswers($data, $table); //update answers
		break;
	case 'DELETE':		
		$id = $_SERVER['QUERY_STRING'];
		$res = deleteRecord($table, "ans_id='{$id}'") ;
		echo $res ? json_encode(selectAnswers($table)) : '';
		break;
	default:
		break;
}

?>