<div class="diagnostics-main-area">

    <h1>{{title}}</h1>

    <div class="intro">
        {{#if header}}<p>{{header}}</p>{{/if}}
        {{#if info}}<p>{{info}}</p>{{/if}}
        {{#if setup}}<p>{{setup}}</p>{{/if}}
        {{#if requireSchoolName}}
            {{#if validateSchoolName}}
        <p>
            <label for="school_number">{{__ "School number:"}}</label>
            <input type="text" data-control="school_number" id="school_number" name="school_number" maxlength="10" placeholder="{{__ "School number"}}" />
        </p>
        <p>
            <label for="school_pin">{{__ "School PIN:"}}</label>
            <input type="text" data-control="school_pin" id="school_pin" name="school_pin" maxlength="4" placeholder="{{__ "School PIN code (4 digits)"}}" />
        </p>
            {{else}}
        <p>
            <label for="school_name">{{__ "School name:"}}</label>
            <input type="text" data-control="school_name" id="school_name" name="school_name" maxlength="255" placeholder="{{__ "School name"}}" />
        </p>
            {{/if}}
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
