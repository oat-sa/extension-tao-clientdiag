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
     * Custom footer copyright notice
     * @type string
     */
    'footer' => '',

    /**
     * Performances check config
     * @type array
     */
    'performances' => array(
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
);
