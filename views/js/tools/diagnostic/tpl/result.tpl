<li data-result="{{id}}">
    <h2>{{title}}</h2>
    <div>
        {{#with feedback}}
        <div class="small feedback feedback-{{type}}">
            <span class="icon icon-{{type}}"></span>
            <span class="msg">{{message}}</span>
            {{#if legend}}<div class="legend">{{legend}}</div>{{/if}}
            {{#if customMsg}}<div class="customMsg">{{customMsg}}</div>{{/if}}
        </div>
        {{/with}}

        {{#with quality}}
        <div class="quality-bar">
            <div class="quality-indicator{{#if wide}} wide{{/if}}"{{#if label}} title="{{label}}"{{/if}}></div>
        </div>
        {{/with}}
    </div>

    {{#with details}}
    <div class="clearfix">
        <button data-action="show-details" class="rgt btn-info small">{{__ 'Show Details'}}</button>
        <button data-action="hide-details" class="rgt btn-info small hidden">{{__ 'Hide Details'}}</button>
        <div class="details hidden">
            <h2>{{__ 'Details'}}</h2>
            <div>
                <table class="matrix">
                    <tbody>
                    {{#each this}}
                        <tr><td>{{message}}</td><td>{{value}}</td></tr>
                    {{/each}}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    {{/with}}
</li>
