<div class="diagnostics-main-area">

    <h1>{{title}}</h1>

    <div class="intro">
        {{#if header}}<p>{{header}}</p>{{/if}}
        {{#if info}}<p>{{info}}</p>{{/if}}
    </div>

    <div class="clearfix">
        <button data-action="test-launcher" class="btn-info small rgt">{{button}}</button>
        <div class="status"></div>
    </div>

    <ul class="plain results"></ul>

</div>
