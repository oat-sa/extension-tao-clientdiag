<?php
/**  
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 * 
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA;
 *               
 * 
 */               

return array(
    'name' => 'taoClientDiagnostic',
	'label' => 'Browser and OS diagnostic tool',
	'description' => 'Check compatibility of the os and browser of a client',
    'license' => 'GPL-2.0',
    'version' => '1.1.0',
	'author' => 'Open Assessment Technologies SA',
	'requires' => array('tao' => '>=2.7.8'),
	// for compatibility
	'dependencies' => array('tao'),
	'managementRole' => 'http://www.tao.lu/Ontologies/generis.rdf#taoClientDiagnosticManager',
    'acl' => array(
        array('grant', 'http://www.tao.lu/Ontologies/generis.rdf#taoClientDiagnosticManager', array('ext'=>'taoClientDiagnostic')),
        array('grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', array('ext'=>'taoClientDiagnostic','mod' => 'CompatibilityChecker', 'act' => 'index')),
        array('grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', array('ext'=>'taoClientDiagnostic','mod' => 'CompatibilityChecker', 'act' => 'check')),
        array('grant', 'http://www.tao.lu/Ontologies/TAO.rdf#DeliveryRole', array('ext'=>'taoClientDiagnostic','mod' => 'CompatibilityChecker', 'act' => 'whichBrowser')),
    ),
    'install' => array(
        'php' => array(
            dirname(__FILE__) . '/scripts/install/createSaveDirectory.php',
        )
    ),
    'uninstall' => array(
    ),
    'update' => 'oat\\taoClientDiagnostic\\scripts\\update\\Updater',
    'routes' => array(
        '/taoClientDiagnostic' => 'oat\\taoClientDiagnostic\\controller'
    ),    
	'constants' => array(
	    # views directory
	    "DIR_VIEWS" => dirname(__FILE__).DIRECTORY_SEPARATOR."views".DIRECTORY_SEPARATOR,
	    
		#BASE URL (usually the domain root)
		'BASE_URL' => ROOT_URL.'taoClientDiagnostic/',
	    
	    #BASE WWW required by JS
	    'BASE_WWW' => ROOT_URL.'taoClientDiagnostic/views/'
	),
    'extra' => array(
        'structures' => dirname(__FILE__).DIRECTORY_SEPARATOR.'controller'.DIRECTORY_SEPARATOR.'structures.xml',
    )
);