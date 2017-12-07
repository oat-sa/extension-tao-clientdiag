<li data-result="{{id}}">
    <h2>{{title}}</h2>
    <div class="result"></div>

    {{#if details}}
    <div class="clearfix">
        <button data-action="show-details" class="rgt btn-info small">{{__ 'Show Details'}}</button>
        <button data-action="hide-details" class="rgt btn-info small hidden">{{__ 'Hide Details'}}</button>
        <div class="details hidden"></div>
    </div>
    {{/if}}
</li>
