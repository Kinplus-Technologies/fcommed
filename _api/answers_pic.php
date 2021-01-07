<?php 
require_once('initialize.php');

$method = $_SERVER['REQUEST_METHOD'];
$table = 'answers_pic';

switch($method){
	case 'GET':
		$u = $_GET['_u'] ;
		@$user_id = $_GET['_u_id'] ;
		if($u==1){
			echo json_encode(selectAnswers($table, '*', "user_id='{$user_id}'"));
		} else if($u==2){
			echo json_encode(selectAnswers($table));
		}
	break;
	case 'POST': 
		$data = json_decode(file_get_contents("php://input")); // Get raw posted data
		$user_id = $data->userId;
		$setup_id = $data->setupId;
		
		$setup = selectSingleRecord("setup", "questn_type", "setup_id='{$setup_id}' and active=1");
		if($setup) extract($setup);		
		$col = " ans_id, questn_type, user_id, setup_id";
		$val = "(uuid(), '{$questn_type}', '{$user_id}', '{$setup_id}')";

    $result = insertRecord($table, $col, $val); 
		
    echo $result ? json_encode(array('submit' => 1)) : json_encode(array('submit' => 0));
		break;
	case 'PUT':
		$data = json_decode(file_get_contents("php://input")); // Get raw posted data		
		$id = $data->ans_id;
		$questns_total = $data->questns_total;
		$questns_answered = $data->questns_answered;
		$questns_unanswered = $data->questns_unanswered;
		$questns_passed = $data->questns_passed;
		$questns_failed = $data->questns_failed;
		$initial_score = $data->initial_score; 
		$final_score = $data->final_score;
		$pass =  $data->pass; 
		$column = " questns_total={$questns_total}, questns_answered={$questns_answered}, questns_unanswered={$questns_unanswered}, questns_passed={$questns_passed}, questns_failed={$questns_failed}, initial_score={$initial_score}, final_score={$final_score}, pass={$pass} ";
		$where_clause = "ans_id='{$id}'";
		$res = updateRecord($table, $column, $where_clause);
		echo $res ? json_encode(selectAnswers($table)): '';
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