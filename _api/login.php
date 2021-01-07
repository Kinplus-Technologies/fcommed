<?php 
require_once('initialize.php');

$data = json_decode(file_get_contents("php://input")); // Get raw posted data
$reg_num = $data->regNum;
$passwd = $data->passwd;
$table = "users";
$column = "*";
$where_clause = "reg_num='{$reg_num}' && passwd='{$passwd}'";

echo json_encode(SelectSingleRecord($table, $column, $where_clause));
?>