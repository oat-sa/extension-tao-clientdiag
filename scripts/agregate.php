<?php
require_once __DIR__ .'/../../tao/includes/raw_start.php';
$date = date('Y_m_d_G_i_s');

$dataPath = FILES_PATH . 'taoClientDiagnostic' . DIRECTORY_SEPARATOR. 'storage' . DIRECTORY_SEPARATOR;
$filePath = $dataPath.'store_'.$date.'.csv';

$dataList = array(
    'key' => '',
    'login' => '',
    'ip' => '',
    'browser' => '',
    'browserVersion' => '',
    'os' => '',
    'osVersion' => '',
    'bandwidth_min' => '',
    'bandwidth_max' => '',
    'bandwidth_sum' => '',
    'bandwidth_count' => '',
    'bandwidth_average' => '',
    'bandwidth_median' => '',
    'bandwidth_variance' => '',
    'bandwidth_duration' => '',
    'bandwidth_size' => '',
    'performance_min' => '',
    'performance_max' => '',
    'performance_sum' => '',
    'performance_count' => '',
    'performance_average' => '',
    'performance_median' => '',
    'performance_variance' => '',
    'compatible' => '',
);

//get all files of the directory
$list = scandir($dataPath);

//create store file or get access to it
if(!file_exists($filePath)){
    $handle = fopen($filePath, 'w');
    fputcsv($handle, array_keys($dataList),';');
    fclose($handle);
}

$fileAggregated = 0;
foreach($list as $file){
    //get only those that are like stpre_1234abcd.csv
    if (preg_match("#^store_atomic_.+\.csv$#",$file)){
        //add all entries to file
        file_put_contents($filePath, file_get_contents($dataPath.$file), FILE_APPEND);
        $fileAggregated++;
    }
}

echo $fileAggregated." files have been aggregated";