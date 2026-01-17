-- Politiques RLS (Row Level Security) pour l'isolation multi-tenant
-- Ces politiques doivent être activées sur Supabase après la migration
-- Activer RLS sur toutes les tables métier
ALTER TABLE
    "public"."clients" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."compagnies" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."contrats" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."dossiers" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."incorporations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."medias" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."notifications" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."paiements" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."partages" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."sinistres" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."vehicules" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."organizations" ENABLE ROW LEVEL SECURITY;

ALTER TABLE
    "public"."organization_members" ENABLE ROW LEVEL SECURITY;

-- Politique pour clients
CREATE POLICY "Users can only see clients from their organizations" ON "public"."clients" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert clients in their organizations" ON "public"."clients" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update clients in their organizations" ON "public"."clients" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete clients in their organizations" ON "public"."clients" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour compagnies
CREATE POLICY "Users can only see compagnies from their organizations" ON "public"."compagnies" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert compagnies in their organizations" ON "public"."compagnies" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update compagnies in their organizations" ON "public"."compagnies" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete compagnies in their organizations" ON "public"."compagnies" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour contrats
CREATE POLICY "Users can only see contrats from their organizations" ON "public"."contrats" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert contrats in their organizations" ON "public"."contrats" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update contrats in their organizations" ON "public"."contrats" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete contrats in their organizations" ON "public"."contrats" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour dossiers
CREATE POLICY "Users can only see dossiers from their organizations" ON "public"."dossiers" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert dossiers in their organizations" ON "public"."dossiers" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update dossiers in their organizations" ON "public"."dossiers" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete dossiers in their organizations" ON "public"."dossiers" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour incorporations
CREATE POLICY "Users can only see incorporations from their organizations" ON "public"."incorporations" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert incorporations in their organizations" ON "public"."incorporations" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update incorporations in their organizations" ON "public"."incorporations" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete incorporations in their organizations" ON "public"."incorporations" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour medias
CREATE POLICY "Users can only see medias from their organizations" ON "public"."medias" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert medias in their organizations" ON "public"."medias" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update medias in their organizations" ON "public"."medias" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete medias in their organizations" ON "public"."medias" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour notifications
CREATE POLICY "Users can only see notifications from their organizations" ON "public"."notifications" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert notifications in their organizations" ON "public"."notifications" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update notifications in their organizations" ON "public"."notifications" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete notifications in their organizations" ON "public"."notifications" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour paiements
CREATE POLICY "Users can only see paiements from their organizations" ON "public"."paiements" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert paiements in their organizations" ON "public"."paiements" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update paiements in their organizations" ON "public"."paiements" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete paiements in their organizations" ON "public"."paiements" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour partages
CREATE POLICY "Users can only see partages from their organizations" ON "public"."partages" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert partages in their organizations" ON "public"."partages" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update partages in their organizations" ON "public"."partages" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete partages in their organizations" ON "public"."partages" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour sinistres
CREATE POLICY "Users can only see sinistres from their organizations" ON "public"."sinistres" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert sinistres in their organizations" ON "public"."sinistres" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update sinistres in their organizations" ON "public"."sinistres" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete sinistres in their organizations" ON "public"."sinistres" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour vehicules
CREATE POLICY "Users can only see vehicules from their organizations" ON "public"."vehicules" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert vehicules in their organizations" ON "public"."vehicules" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can update vehicules in their organizations" ON "public"."vehicules" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can delete vehicules in their organizations" ON "public"."vehicules" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
    )
);

-- Politique pour organizations (les utilisateurs peuvent voir les organisations dont ils sont membres)
CREATE POLICY "Users can see their organizations" ON "public"."organizations" FOR
SELECT
    USING (
        id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can create organizations" ON "public"."organizations" FOR
INSERT
    WITH CHECK (true);

CREATE POLICY "Users can update organizations they own or admin" ON "public"."organizations" FOR
UPDATE
    USING (
        id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
                AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can delete organizations they own" ON "public"."organizations" FOR DELETE USING (
    id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
            AND role = 'owner'
    )
);

-- Politique pour organization_members
CREATE POLICY "Users can see members of their organizations" ON "public"."organization_members" FOR
SELECT
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
        )
    );

CREATE POLICY "Users can insert members in organizations they own or admin" ON "public"."organization_members" FOR
INSERT
    WITH CHECK (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
                AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can update members in organizations they own or admin" ON "public"."organization_members" FOR
UPDATE
    USING (
        organization_id IN (
            SELECT
                organization_id
            FROM
                organization_members
            WHERE
                user_id = auth.uid()
                AND status = 'active'
                AND role IN ('owner', 'admin')
        )
    );

CREATE POLICY "Users can delete members in organizations they own or admin" ON "public"."organization_members" FOR DELETE USING (
    organization_id IN (
        SELECT
            organization_id
        FROM
            organization_members
        WHERE
            user_id = auth.uid()
            AND status = 'active'
            AND role IN ('owner', 'admin')
    )
);