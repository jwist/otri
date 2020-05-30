<?php
require 'lib/rb.php';

$timeout = 10;

date_default_timezone_set("America/Bogota");
$apiUrl = 'https://api.telegram.org/bot311119952:AAEgZNHXvxYwyGwSzpt2olvBm4kMe1ebAjc/';

R::setup( 'mysql:host=localhost;dbname=otribot', 'root', '' );

function getPatents(){
    $patentsResponse = file_get_contents('https://patentes-e137b.firebaseio.com/patents.json');
    $patents = json_decode($patentsResponse, true);
    return $patents;
}

function getCountries(){
    $countriesArray = array();
    $countriesResponse = file_get_contents('https://patentes-e137b.firebaseio.com/references/countries.json');
    $countries = json_decode($countriesResponse, true);
    return $countries;
}

function sendMessage($chatId, $message){
    $params = "chat_id=".$chatId."&text=".$message;
    echo $params;
    $message = file_get_contents($GLOBALS['apiUrl'].'sendMessage?'.$params);
    return $message;
}

function sendDocument($chatId, $url){
    $params = "chat_id=".$chatId."&document=".$url;
    echo $params;
    $message = file_get_contents($GLOBALS['apiUrl'].'sendDocument?'.$params);
    return $message;
}

function sendMessageWithOptions($chatId, $message, $options){
    $options["resize_keyboard"] = true;
    $optionsString = json_encode($options);
    $params = "chat_id=".$chatId."&text=".$message."&reply_markup=".$optionsString;
    echo $params;
    $message = file_get_contents($GLOBALS['apiUrl'].'sendMessage?'.$params);
    return $message;
}

function getPatentsByCountry($patents){
    $patentsResult = array();
    foreach($patents as $patent){
        if(isset($patentsResult[$patent["country"]])){
            $patentsResult[$patent["country"]] += 1;
        }else{
            $patentsResult[$patent["country"]] = 1;
        }                    
    }

    $countries = array();
    foreach($patentsResult as $country => $valor){
        $countries[] = $country." (".$valor.")";
    }
    
    return implode("%0A", $countries);
}

function getLastResults($chatId){
    $query = "SELECT * FROM last_result WHERE chat_id = '".$chatId."'";
    $results = R::getAll($query);
    return json_decode($results[0]["result"]);
}

function getLastMessage($chatId){
    $query = "SELECT * FROM messages WHERE chat_id = '".$chatId."' ORDER BY message_id desc";
    $results = R::getAll($query);
    return $results[0]["message"];
}

function saveLastResult($chatId, $results){
    R::exec( "DELETE FROM last_result WHERE chat_id = '".$chatId."'" );
    $query = "INSERT INTO last_result (chat_id, result) VALUES ('".$chatId."', '".json_encode($results)."')";
    R::exec( $query );
}

function createTutorialMessage(){
    //"use %0A%2Fpatents %0A%2Fpatents text %0A%2FpatentsByCountry %0A%2FpatentsByCountry countryCode"
    $message = "Bienvenido, %0A¿Que quieres saber?%0A1. numero de patentes nacionales%0A2. numero de patentes internacionales%0A3. lista de paises donde hay patentes%0AEscribe el numero de la opcion deseada.";
    return $message;
}


$patents = array();
$countries = array();
for($i = 0; $i < floor(60/$timeout); $i++){
    $updatesResponse = file_get_contents($apiUrl.'getUpdates');

    $updates = json_decode($updatesResponse, true);

    foreach($updates["result"] as $result){
        $lastupdate = strtotime("-".$timeout." seconds");
        if($result["message"]["date"] >= $lastupdate){
            if(empty($patents)){
                $patents = getPatents();
            }
            
            $queryParts = explode(" ", trim($result["message"]["text"]));
            $queryText = strtolower(trim($result["message"]["text"]));
            echo $queryText;
            if(sizeof($queryParts) > 0){ 
                if($queryParts[0] == "/start"){
                    sendMessage($result["message"]["chat"]["id"], createTutorialMessage());   
                }else if($queryParts[0] == "1"){
                    $countLocals = 0;
                    foreach($patents as $patent){
                        if(strtolower($patent["country"]) == 'col'){
                            $countLocals++;
                        } 
                    }
                    $options = array();
                    $options["keyboard"] = array(array("/showLocal SI","NO"));
                    sendMessageWithOptions($result["message"]["chat"]["id"], "Hay ".$countLocals." patentes nacionales.%0ADesea ver las patentes?", $options);
                }else if($queryParts[0] == "2" ){
                    $countLocals = 0;
                    foreach($patents as $patent){
                        if(strtolower($patent["country"]) !== 'col'){
                            $countLocals++;
                        } 
                    }
                    $options = array();
                    $options["keyboard"] = array(array("/showExternal SI","NO"));
                    sendMessageWithOptions($result["message"]["chat"]["id"], "Hay ".$countLocals." patentes nacionales.%0ADesea ver las patentes?", $options);
                }else if($queryParts[0] == "3" ){
                    $patentsByCountry = getPatentsByCountry($patents);
                    sendMessage($result["message"]["chat"]["id"], $patentsByCountry);
                    sendMessage($result["message"]["chat"]["id"], "Para ver las patentes en un pais, por favor escriba %2Fshow seguido de la sigla del pais.");
                }else if($queryParts[0] == "/showLocal" ){
                    $index = 1;
                    $results = array();
                    foreach($patents as $patentId => $patent){
                        if(strtolower($patent["country"]) == 'col'){
                            sendMessage($result["message"]["chat"]["id"], $index." ".$patent["description"]." - ".$patent["country"]);
                            $results[] = $patentId;
                            $index++;
                        } 
                    }
                    saveLastResult($result["message"]["chat"]["id"], $results);
                    sendMessage($result["message"]["chat"]["id"], "Para descargar el documento asociado a una patente digite %2Fdownload seguido por el numero de la patente.");
                }else if($queryParts[0] == "/showExternal" ){
                    $index = 1;
                    $results = array();
                    foreach($patents as $patentId => $patent){
                        if(strtolower($patent["country"]) !== 'col'){
                            sendMessage($result["message"]["chat"]["id"], $index." ".$patent["description"]." - ".$patent["country"]);
                            $results[] = $patentId;
                            $index++;
                        } 
                    }
                    saveLastResult($result["message"]["chat"]["id"], $results);
                    sendMessage($result["message"]["chat"]["id"], "Para descargar el documento asociado a una patente digite %2Fdownload seguido por el numero de la patente.".$queryParts[1]);
                }else if($queryParts[0] == "/show" ){
                    $index = 1;
                    $results = array();
                    foreach($patents as $patentId => $patent){
                        if(strtolower($patent["country"]) == strtolower($queryParts[1])){
                            sendMessage($result["message"]["chat"]["id"], $index." ".$patent["description"]." - ".$patent["country"]);
                            $results[] = $patentId;
                            $index++;
                        } 
                    }
                    saveLastResult($result["message"]["chat"]["id"], $results);
                    sendMessage($result["message"]["chat"]["id"], "Para descargar el documento asociado a una patente digite %2Fdownload seguido por el numero de la patente.".$queryParts[1]);
                }else if($queryParts[0] == "/download" ){
                    $results = getLastResults($result["message"]["chat"]["id"]);
                    $index = $queryParts[1];
                    $patentId = $results[intval($index)-1];
                    $patentDocuments = $patents[$patentId]["documents"];
                    if(!empty($patentDocuments)){
                        sendDocument($result["message"]["chat"]["id"], "http://afv.mobi/otriBot/downloadpdf.php?patent_id=".$patentId);
                    }else{
                        sendMessage($result["message"]["chat"]["id"], "No hay documentos para la patente con el indice: ".$queryParts[1]);
                    }                    
                }else if($queryParts[0] == "/patents" || $queryParts[0] == "/patentes"){
                    if(sizeof($queryParts) > 1 && $queryParts[1] != ""){
                        $resultFound = false;
                        $index = 1;
                        $results = array();
                        foreach($patents as $patentId => $patent){
                            if(strpos(strtolower($patent["description"]), strtolower($queryParts[1]))!==false){
                                sendMessage($result["message"]["chat"]["id"], $index." ".$patent["description"]." - ".$patent["country"]);
                                $results[] = $patentId;
                                $index++;
                                $resultFound = true;
                            } 
                        }
                        if(!$resultFound){
                            sendMessage($result["message"]["chat"]["id"], "No hay patentes que concuerden con la busqueda: ".$queryParts[1]);
                            $resultFound = true;
                        }else{
                            saveLastResult($result["message"]["chat"]["id"], $results);
                        }
                    }else{
                        $index = 1;
                        $results = array();
                        foreach($patents as $patentId => $patent){
                            sendMessage($result["message"]["chat"]["id"], $index." ".$patent["description"]." - ".$patent["country"]);
                            $results[] = $patentId;
                            $index++;
                        }
                        saveLastResult($result["message"]["chat"]["id"], $results);
                    }
                }else if($queryParts[0] == "/patentsByCountry" || $queryParts[0] == "/patentesXPais"){
                    if(sizeof($queryParts) > 1 && $queryParts[1] != ""){
                        $resultFound = false;
                        $index = 1;
                        $results = array();
                        foreach($patents as $patentId => $patent){
                            if(strpos(strtolower($patent["country"]), strtolower($queryParts[1]))!==false){
                                sendMessage($result["message"]["chat"]["id"], $index." ".$patent["description"]." - ".$patent["country"]);
                                $results[] = $patentId;
                                $index++;
                                $resultFound = true;
                            } 
                        }
                        if(!$resultFound){
                            sendMessage($result["message"]["chat"]["id"], "No hay patentes en el pais: ".$queryParts[1]);
                            $resultFound = true;
                        }else{
                            saveLastResult($result["message"]["chat"]["id"], $results);
                        }
                    }else{
                        $patentsByCountry = getPatentsByCountry($patents);
                        sendMessage($result["message"]["chat"]["id"], $patentsByCountry);
                    }
                }else if(strpos($queryText, "patent") !== false){
                    if(strpos($queryText, "cuantas") !== false || strpos($queryText, "how many") !== false){
                        if(strpos($queryText, "countr") !== false || strpos($queryText, "pais") !== false){ 
                            $patentsByCountry = getPatentsByCountry($patents);                   
                            sendMessage($result["message"]["chat"]["id"], "Found ".$patentsByCountry);        
                        }else{
                            sendMessage($result["message"]["chat"]["id"], "Found ".sizeof($patents)." patents.");
                        }
                    }else{
                       if(strpos($queryText, "countr") !== false || strpos($queryText, "pais") !== false){ 
                                     
                       }else{
                            $index = 1;
                            $results = array();
                            foreach($patents as $patentId => $patent){
                                sendMessage($result["message"]["chat"]["id"], $index." ".$patent["description"]." - ".$patent["country"]);
                                $results[] = $patentId;
                                $index++;
                            }
                            saveLastResult($result["message"]["chat"]["id"], $results);
                       }
                    }
                }else{
                    sendMessage($result["message"]["chat"]["id"], createTutorialMessage());    
                }
            }else{
                sendMessage($result["message"]["chat"]["id"], createTutorialMessage());
            }
        }
    }
    sleep($timeout);
}

?>