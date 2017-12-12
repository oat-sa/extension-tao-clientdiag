{{#if value}}
<span class="detailed-value{{#if errors}} errors{{/if}}"{{#if errors}} title="{{__ "Errors occurred! Please see details"}}"{{/if}}>
    <span class="value">{{value}}{{#if errors}} <span class="icon-warning"></span>{{/if}}</span>
    <span class="details icon-info" title="{{__ "Show fingerprint details"}}"></span>
    </span>
{{/if}}

