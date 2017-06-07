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
 */

/**
 * Default client diag config
 */
return array(

    /**
     * Diagnostic will be run on the page load
     */
    'autoStart' => false,

    /**
     * The results of all diagnostic runs will be saved
     * (learners and students will see only their runs, teachers and administrators will see all possible runs)
     */
    'storeAllRuns' => false,

    /**
     * Custom text for diagnostic header
     * @string
     */
    'diagHeader' => 'This tool will run a number of tests in order to establish how well your current environment is suitable to run the TAO platform.',

    /**
     * Custom footer copyright notice
     * @type string
     */
    'footer' => '',
    'testers' => [
        /**
         * Performances check config
         * @type array
         */
        'performance' => array(
            'tester' => 'taoClientDiagnostic/tools/performances/tester',
            /**
             * A list of samples to render in order to compute the rendering performances
             * @type array
             */
            'samples' => array(
                'taoClientDiagnostic/tools/performances/data/sample1/',
                'taoClientDiagnostic/tools/performances/data/sample2/',
                'taoClientDiagnostic/tools/performances/data/sample3/'
            ),

            /**
             * The number of renderings by samples
             * @type int
             */
            'occurrences' => 10,

            /**
             * Max allowed duration for a sample rendering
             * @type int
             */
            'timeout' => 30,

            /**
             * The threshold for optimal performances
             * @type float
             */
            'optimal' => 0.025,

            /**
             * The threshold for minimal performances
             * @type float
             */
            'threshold' => 0.25,
        ),

        /**
         * Bandwidth check config
         * @type array
         */
        'bandwidth' => array(
            'tester' => 'taoClientDiagnostic/tools/bandwidth/tester',
            /**
             * The typical bandwidth needed for a test taker (Mbps)
             * @type float
             */
            'unit' => 0.16,

            /**
             * The ideal number of simultaneous test takers
             * @type int
             */
            'ideal' => 45,

            /**
             * Maximum number of test takers to display on a bar
             * @type int
             */
            'max' => 100,
        ),

        /**
         * Upload speed test config
         */
        'upload' => array(
            'tester' => 'taoClientDiagnostic/tools/upload/tester',
            /**
             * Size of data to sent to server during speed test in bytes
             */
            'size' => 1 * 1024 * 1024,

            /**
             * Optimal speed in bytes per second
             */
            'optimal' => 1 * 1024 * 1024,
        ),
        'browser' => [
            'tester' => 'taoClientDiagnostic/tools/browser/tester',
        ],
    ]
);
