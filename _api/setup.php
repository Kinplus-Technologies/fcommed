<?php 
require_once('initialize.php');

$method = $_SERVER['REQUEST_METHOD'];
$table = 'setup';

switch($method){
	case 'GET':
		$u = $_GET['_u'] ;
		if($u==1){
			echo json_encode(SelectRecords($table, '*', "active=1 ORDER BY created_on DESC"));
		} else if($u==2){
			echo json_encode(SelectRecords($table, '*', "1 ORDER BY created_on DESC"));
		}
		break;
	case 'POST':
		$data = json_decode(file_get_contents("php://input")); // Get raw posted data
		$id = $data->setup_id;
		$total_questns = $data->total_questns;
		$questns_per_page = $data->questns_per_page;
		$pass_mark = $data->pass_mark;
		$hrs = $data->hrs;
		$mins = $data->mins;
		$negative_marking = $data->negative_marking;
		$category = $data->category;
		$questn_type = $data->questn_type;
		$active = $data->active;
		$dept_id = $data->dept_id;
		if($id){
			$column = "total_questns={$total_questns}, questns_per_page={$questns_per_page}, pass_mark={$pass_mark}, hrs={$hrs}, mins={$mins}, negative_marking={$negative_marking}, category='{$category}', active={$active}";
			$where_clause = "setup_id='{$id}'";
			$res = updateRecord($table, $column, $where_clause);
		} else{
			$column = "setup_id, dept_id, questn_type, total_questns, questns_per_page, pass_mark, hrs, mins, negative_marking, active, category";
			$value = "(uuid(),'{$dept_id}', '{$questn_type}', $total_questns, $questns_per_page, $pass_mark,$hrs,$mins, $negative_marking, $active, '{$category}')";
			$res = insertRecord($table, $column, $value);
		}
		echo $res ? json_encode(SelectRecords($table, '*', "1 ORDER BY created_on DESC")) : '';
		break;
	case 'DELETE':		
		$id = $_SERVER['QUERY_STRING'];
		$res = deleteRecord($table, "setup_id='{$id}'") ;
		echo $res ? json_encode(SelectRecords($table, '*', "1 ORDER BY created_on DESC")) : '';
		break;
	default:
		break;
}

?> 