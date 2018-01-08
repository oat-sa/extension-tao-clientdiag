<div class="diagnostics-main-area">

    <h1>{{title}}</h1>

    <div class="intro">
        {{#if header}}<p>{{header}}</p>{{/if}}
        {{#if info}}<p>{{info}}</p>{{/if}}
        {{#if setup}}<p>{{setup}}</p>{{/if}}
        {{#if requireSchoolName}}
        <p>
            <label for="school">{{__ "School:"}}</label>
            <input type="text" data-control="school" id="school" name="school" maxlength="255" placeholder="{{__ "School name"}}" />
        </p>
        {{/if}}
    </div>

    <div class="clearfix">
        <button data-action="test-launcher" class="btn-info small rgt">{{button}}</button>
    </div>

    <ul class="plain results"></ul>

    <div class="status">
        <h2></h2>
    </div>

</div>
